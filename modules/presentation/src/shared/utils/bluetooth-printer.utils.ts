// Web Bluetooth Types Definition (Strictly no `any`)
export interface WebBluetoothDevice extends EventTarget {
  id: string;
  name?: string;
  gatt?: WebBluetoothRemoteGATTServer;
}

export interface WebBluetoothRemoteGATTServer {
  connected: boolean;
  connect(): Promise<WebBluetoothRemoteGATTServer>;
  disconnect(): void;
  getPrimaryService(service: BluetoothServiceUUID): Promise<WebBluetoothRemoteGATTService>;
  getPrimaryServices(service?: BluetoothServiceUUID): Promise<WebBluetoothRemoteGATTService[]>;
}

export interface WebBluetoothRemoteGATTService {
  uuid: string;
  getCharacteristic(characteristic: BluetoothCharacteristicUUID): Promise<WebBluetoothRemoteGATTCharacteristic>;
  getCharacteristics(characteristic?: BluetoothCharacteristicUUID): Promise<WebBluetoothRemoteGATTCharacteristic[]>;
}

export interface WebBluetoothRemoteGATTCharacteristic {
  uuid: string;
  properties: {
    write: boolean;
    writeWithoutResponse: boolean;
  };
  writeValue(value: BufferSource): Promise<void>;
  writeValueWithoutResponse?(value: BufferSource): Promise<void>;
}

export type BluetoothServiceUUID = number | string;
export type BluetoothCharacteristicUUID = number | string;

export interface RequestDeviceOptions {
  filters?: Array<{
    name?: string;
    namePrefix?: string;
    services?: BluetoothServiceUUID[];
  }>;
  optionalServices?: BluetoothServiceUUID[];
  acceptAllDevices?: boolean;
}

export interface NavigatorWithBluetooth extends Navigator {
  bluetooth?: {
    requestDevice(options: RequestDeviceOptions): Promise<WebBluetoothDevice>;
  };
}

// Common Thermal Printer BLE GATT Service UUIDs
const COMMON_PRINTER_SERVICES: BluetoothServiceUUID[] = [
  0xffe0,
  0xff00,
  0x18f0,
  0xfee7,
  0xae00,
  "0000ffe0-0000-1000-8000-00805f9b34fb",
  "0000ff00-0000-1000-8000-00805f9b34fb",
  "000018f0-0000-1000-8000-00805f9b34fb",
  "0000fee7-0000-1000-8000-00805f9b34fb",
  "0000ae00-0000-1000-8000-00805f9b34fb",
  "49535343-fe7d-4ae5-8fa9-9fafd205e455",
  "e7810a71-73ae-499d-8c15-faa9aef0c3f2",
];

/**
 * Check if the current browser environment supports Web Bluetooth API.
 */
export const isWebBluetoothSupported = (): boolean => {
  return typeof navigator !== "undefined" && "bluetooth" in navigator;
};

/**
 * Convert raw binary ESC/POS string to Uint8Array preserving single-byte control codes.
 */
export const rawStringToUint8Array = (raw: string): Uint8Array => {
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    bytes[i] = raw.charCodeAt(i) & 0xff;
  }
  return bytes;
};

/**
 * Traverse services and discover the first characteristic capable of writing data.
 */
const findWritableCharacteristic = async (
  server: WebBluetoothRemoteGATTServer,
): Promise<WebBluetoothRemoteGATTCharacteristic> => {
  for (const serviceUuid of COMMON_PRINTER_SERVICES) {
    try {
      const service = await server.getPrimaryService(serviceUuid);
      const characteristics = await service.getCharacteristics();
      for (const char of characteristics) {
        if (char.properties.write || char.properties.writeWithoutResponse) {
          return char;
        }
      }
    } catch {
      // Service not matched on this device, check next candidate
    }
  }

  // Fallback: iterate over all discovered primary services
  try {
    const services = await server.getPrimaryServices();
    for (const service of services) {
      try {
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            return char;
          }
        }
      } catch {
        // Skip characteristic inspection failure
      }
    }
  } catch {
    // Ignore and proceed to error
  }

  throw new Error("Karakteristik (port kirim) printer Bluetooth tidak ditemukan.");
};

export interface PrintBluetoothOptions {
  chunkSize?: number;
  delayMs?: number;
}

/**
 * Connect to a BLE Thermal Printer and send ESC/POS byte commands with chunking.
 * Returns the printer name upon success.
 */
export const printViaWebBluetooth = async (
  rawData: string | Uint8Array,
  options: PrintBluetoothOptions = {},
): Promise<string> => {
  const nav = navigator as NavigatorWithBluetooth;
  if (!nav.bluetooth) {
    throw new Error(
      "Browser tidak mendukung Web Bluetooth. Pastikan menggunakan Google Chrome di Android/PC dan via koneksi HTTPS/localhost.",
    );
  }

  const { chunkSize = 50, delayMs = 20 } = options;
  const payload = typeof rawData === "string" ? rawStringToUint8Array(rawData) : rawData;

  // 1. Request user to select Bluetooth device
  const device = await nav.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: COMMON_PRINTER_SERVICES,
  });

  if (!device.gatt) {
    throw new Error("Perangkat Bluetooth tidak memiliki GATT Server.");
  }

  // 2. Connect to GATT Server
  const server = await device.gatt.connect();

  try {
    // 3. Find writable characteristic
    const characteristic = await findWritableCharacteristic(server);

    // 4. Send payload in chunks to avoid BLE buffer overflow
    for (let offset = 0; offset < payload.length; offset += chunkSize) {
      const chunk = payload.slice(offset, offset + chunkSize);

      if (characteristic.properties.writeWithoutResponse && characteristic.writeValueWithoutResponse) {
        await characteristic.writeValueWithoutResponse(chunk);
      } else {
        await characteristic.writeValue(chunk);
      }

      if (delayMs > 0 && offset + chunkSize < payload.length) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    return device.name || "Printer Bluetooth";
  } finally {
    // Clean up GATT connection after slight flush delay
    setTimeout(() => {
      try {
        if (server.connected) {
          server.disconnect();
        }
      } catch {
        // Ignore disconnect error
      }
    }, 500);
  }
};

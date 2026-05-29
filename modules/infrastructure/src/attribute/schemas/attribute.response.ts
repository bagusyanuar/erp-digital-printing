export interface AttributeOptionResponse {
  id: string;
  value: string;
}

export interface AttributeResponse {
  id: string;
  name: string;
  value_type: string;
  options?: AttributeOptionResponse[];
}

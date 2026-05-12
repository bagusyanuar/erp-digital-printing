// ERP Percetakan - Database Schema (PostgreSQL)

Table categories {
id uuid [pk, default: `uuid_generate_v4()`]
name varchar [note: 'Contoh: A3+, MMT, Indoor Media, Stand Banner']
description text
created_at timestamp [default: `now()`]
}

Table products {
id uuid [pk, default: `uuid_generate_v4()`]
category_id uuid [ref: > categories.id]
name varchar [note: 'Contoh: Art Paper 150, MMT 280gr, Sticker Vinyl']
uom varchar [note: 'Satuan: pcs, m2, m_lari, box']
is_active boolean [default: true]
}

Table product_variants {
id uuid [pk, default: `uuid_generate_v4()`]
product_id uuid [ref: > products.id]
variant_name varchar [note: 'Contoh: 1 Sisi, 2 Sisi, Polosan, Tanpa Laminasi']
additional_cost decimal(15,2) [default: 0]
}

// Entity-Attribute-Value (EAV) Structure
Table attributes {
id uuid [pk, default: `uuid_generate_v4()`]
name varchar [note: 'Contoh: Sisi Cetak, Gramasi, Warna Stand, Ukuran']
unit varchar
}

Table product_attribute_values {
id uuid [pk, default: `uuid_generate_v4()`]
variant_id uuid [ref: > product_variants.id]
attribute_id uuid [ref: > attributes.id]
value varchar [note: 'Contoh: 2 Sisi, 280gr, Hitam, 60x160']

Indexes {
(variant_id, attribute_id) [unique]
}
}

// Pricing Logic
Table customer_levels {
id uuid [pk, default: `uuid_generate_v4()`]
name varchar [note: 'Contoh: Regular, Reseller, Agen']
}

Table price_tiers {
id uuid [pk, default: `uuid_generate_v4()`]
variant_id uuid [ref: > product_variants.id]
customer_level_id uuid [ref: > customer_levels.id]
min_qty decimal(15,2) [note: 'Mendukung kuantitas desimal seperti meter persegi']
max_qty decimal(15,2) [note: 'NULL berarti tidak terhingga (> X)']
price_per_unit decimal(15,2)

Indexes {
(variant_id, customer_level_id, min_qty) [unique]
}
}

// Bundling & Packages (Contoh: Paket Kartu Nama / Paket Banner)
Table bundles {
id uuid [pk, default: `uuid_generate_v4()`]
name varchar [note: 'Contoh: Paket Kartu Nama 1 Sisi Laminasi']
base_price decimal(15,2)
}

Table bundle_items {
id uuid [pk, default: `uuid_generate_v4()`]
bundle_id uuid [ref: > bundles.id]
product_id uuid [ref: > products.id]
qty int [default: 1]
}

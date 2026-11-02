-- GROZO reference data only. No products, orders, customers, credentials or locations.
BEGIN;
INSERT INTO roles(name) VALUES ('customer'),('operator'),('rider'),('admin') ON CONFLICT DO NOTHING;
INSERT INTO business_settings(singleton,minimum_order_paise,free_delivery_threshold_paise,
 delivery_charge_paise,maximum_basket_paise,delivery_tax_rate_bps,cod_enabled)
 VALUES(true,19900,39900,1900,500000,NULL,false) ON CONFLICT DO NOTHING;
-- NULL delivery tax is intentional: checkout must remain disabled until reviewed.
INSERT INTO categories(id,name,slug) VALUES
 ('00000000-0000-4000-8000-000000000001','Fruits','fruits'),
 ('00000000-0000-4000-8000-000000000002','Vegetables','vegetables'),
 ('00000000-0000-4000-8000-000000000003','Dairy Products','dairy'),
 ('00000000-0000-4000-8000-000000000004','Bakery','bakery'),
 ('00000000-0000-4000-8000-000000000005','Snacks','snacks'),
 ('00000000-0000-4000-8000-000000000006','Beverages','beverages'),
 ('00000000-0000-4000-8000-000000000007','Personal Care','personal-care'),
 ('00000000-0000-4000-8000-000000000008','Household Essentials','household'),
 ('00000000-0000-4000-8000-000000000009','Cleaning Products','cleaning'),
 ('00000000-0000-4000-8000-000000000010','Grocery Staples','staples'),
 ('00000000-0000-4000-8000-000000000011','Frozen Foods','frozen'),
 ('00000000-0000-4000-8000-000000000012','Baby Care','baby-care')
 ON CONFLICT DO NOTHING;
COMMIT;

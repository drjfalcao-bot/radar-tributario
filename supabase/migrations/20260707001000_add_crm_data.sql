alter table diagnosticos
  add column if not exists crm_data jsonb;

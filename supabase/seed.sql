insert into public.event_settings (
  id,
  event_date,
  event_time,
  location_name,
  address,
  google_maps_url,
  whatsapp_number,
  dress_code,
  welcome_message,
  event_headline,
  event_description,
  couple_photo_url,
  couple_photo_alt,
  ultrasound_photo_url,
  ultrasound_photo_alt
)
values (
  '00000000-0000-0000-0000-000000000001',
  '2026-08-22 15:00:00-03',
  '15h',
  'Informe o local no admin',
  'Informe o endereco no admin',
  'https://maps.google.com',
  '5500000000000',
  'Tons claros, verde salvia, bege ou branco',
  'Estamos preparando cada detalhe com carinho para receber o Manoel. Sua presenca e seu gesto tornam esse momento ainda mais especial.',
  'Um encontro leve e cheio de afeto',
  'Confira data, horario, local e orientacoes do cha de bebe.',
  null,
  'Foto da familia do Manoel',
  null,
  'Ultrassom do Manoel'
)
on conflict (id) do update
set
  event_date = excluded.event_date,
  event_time = excluded.event_time,
  location_name = excluded.location_name,
  address = excluded.address,
  google_maps_url = excluded.google_maps_url,
  whatsapp_number = excluded.whatsapp_number,
  dress_code = excluded.dress_code,
  welcome_message = excluded.welcome_message,
  event_headline = excluded.event_headline,
  event_description = excluded.event_description,
  couple_photo_url = excluded.couple_photo_url,
  couple_photo_alt = excluded.couple_photo_alt,
  ultrasound_photo_url = excluded.ultrasound_photo_url,
  ultrasound_photo_alt = excluded.ultrasound_photo_alt;

insert into public.categories (name, slug, description, display_order, is_active)
values
  ('Higiene', 'higiene', 'Cuidados diarios, fraldas, pomadas e itens de banho.', 1, true),
  ('Alimentacao', 'alimentacao', 'Itens para mamadas e introducao alimentar.', 2, true),
  ('Passeio', 'passeio', 'Seguranca e praticidade fora de casa.', 3, true),
  ('Desenvolvimento', 'desenvolvimento', 'Brinquedos sensoriais, leitura e descobertas.', 4, true),
  ('Enxoval atual', 'enxoval-atual', 'Itens ja adquiridos e usados somente no calculo do progresso.', 99, true)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  display_order = excluded.display_order,
  is_active = excluded.is_active;

insert into public.gifts (
  category_id,
  name,
  slug,
  suggested_brands,
  image_url,
  description,
  notes,
  quantity_needed,
  quantity_owned,
  quantity_reserved,
  progress_weight,
  status,
  is_public,
  display_order
)
select
  c.id,
  v.name,
  v.slug,
  v.suggested_brands,
  v.image_url,
  v.description,
  v.notes,
  v.quantity_needed,
  v.quantity_owned,
  v.quantity_reserved,
  v.progress_weight,
  v.status,
  v.is_public,
  v.display_order
from (
  values
    ('higiene', 'Fralda M', 'fralda-m', array['Pampers Premium Care','Huggies Supreme Care','MamyPoko','Pampers Confort Sec','Cremer Jumbo']::text[], null::text, 'Fraldas tamanho M para o dia a dia do Manoel.', 'O enxoval ja possui aproximadamente 566 fraldas M.', 800, 566, 0, 1::numeric, 'available'::public.gift_status, true, 1),
    ('higiene', 'Fralda G', 'fralda-g', array['Pampers Premium Care','Huggies Supreme Care','MamyPoko','Pampers Confort Sec','Cremer Jumbo']::text[], null::text, 'Fraldas tamanho G para os proximos meses.', 'Pacotes jumbo sao bem-vindos.', 420, 0, 0, 1::numeric, 'available'::public.gift_status, true, 2),
    ('higiene', 'Fralda XG', 'fralda-xg', array['Pampers Premium Care','Huggies Supreme Care','MamyPoko','Pampers Confort Sec','Cremer Jumbo']::text[], null::text, 'Fraldas tamanho XG para completar o estoque.', null::text, 260, 0, 0, 1::numeric, 'available'::public.gift_status, true, 3),
    ('higiene', 'Fralda XXG', 'fralda-xxg', array['Pampers Premium Care','Huggies Supreme Care','MamyPoko','Pampers Confort Sec','Cremer Jumbo']::text[], null::text, 'Fraldas XXG para deixar o enxoval preparado com folga.', null::text, 180, 0, 0, 1::numeric, 'available'::public.gift_status, true, 4),
    ('higiene', 'Lenco umedecido', 'lenco-umedecido', array['Huggies Extra Suave','Pampers Sensitive','Johnson''s','MamyPoko','Granado']::text[], null::text, 'Lencos suaves para higiene diaria.', 'Preferencia por linhas extra suave ou sensitive.', 40, 0, 0, 2::numeric, 'available'::public.gift_status, true, 5),
    ('higiene', 'Algodao quadrado', 'algodao-quadrado', array['Cremer','Apolo','York','Sussex','Nathy']::text[], null::text, 'Algodao quadrado para trocas e cuidados delicados.', null::text, 8, 0, 0, 2::numeric, 'available'::public.gift_status, true, 6),
    ('higiene', 'Bepantol Baby', 'bepantol-baby', array['Bepantol Baby','Hipoglos Amendoas','Desitin','Mustela','Dermodex']::text[], null::text, 'Pomada preventiva para assaduras.', null::text, 4, 0, 0, 3::numeric, 'available'::public.gift_status, true, 7),
    ('higiene', 'Hipoglos Amendoas', 'hipoglos-amendoas', array['Bepantol Baby','Hipoglos Amendoas','Desitin','Mustela','Dermodex']::text[], null::text, 'Pomada para complementar os cuidados de higiene.', null::text, 4, 0, 0, 3::numeric, 'available'::public.gift_status, true, 8),
    ('higiene', 'Sabonete liquido', 'sabonete-liquido', array['Mustela','Bioderma','Granado','Johnson''s','Dove Baby']::text[], null::text, 'Sabonete liquido suave para recem-nascido.', 'O enxoval ja possui 2 unidades.', 6, 2, 0, 3::numeric, 'available'::public.gift_status, true, 9),
    ('higiene', 'Shampoo', 'shampoo', array['Mustela','Bioderma','Granado','Johnson''s','Dove Baby']::text[], null::text, 'Shampoo infantil delicado.', null::text, 4, 0, 0, 3::numeric, 'available'::public.gift_status, true, 10),
    ('higiene', 'Soro fisiologico', 'soro-fisiologico', array['Equiplex','JP Farma','Farmax','Eurofarma','Halex Istar']::text[], null::text, 'Soro fisiologico para cuidados respiratorios e higiene.', null::text, 8, 0, 0, 2::numeric, 'available'::public.gift_status, true, 11),
    ('alimentacao', 'Mamadeiras', 'mamadeiras', array['Philips Avent','MAM','NUK','Chicco']::text[], null::text, 'Mamadeiras de diferentes fluxos para acompanhar a rotina.', null::text, 4, 0, 0, 3::numeric, 'available'::public.gift_status, true, 20),
    ('alimentacao', 'Escova de mamadeira', 'escova-de-mamadeira', array['MAM','Kuka','Chicco','Buba']::text[], null::text, 'Escova propria para higienizar mamadeiras.', null::text, 2, 0, 0, 2::numeric, 'available'::public.gift_status, true, 21),
    ('alimentacao', 'Escorredor', 'escorredor', array['Buba','Munchkin','Chicco']::text[], null::text, 'Escorredor para mamadeiras, bicos e acessorios.', null::text, 1, 0, 0, 3::numeric, 'available'::public.gift_status, true, 22),
    ('alimentacao', 'Pratos', 'pratos', array['Buba','Marcus & Marcus','Munchkin','Lillo']::text[], null::text, 'Pratinhos para a fase de introducao alimentar.', null::text, 3, 0, 0, 2::numeric, 'available'::public.gift_status, true, 23),
    ('alimentacao', 'Talheres', 'talheres', array['Buba','Munchkin','Lillo','Chicco']::text[], null::text, 'Talheres infantis com pega confortavel.', null::text, 3, 0, 0, 2::numeric, 'available'::public.gift_status, true, 24),
    ('alimentacao', 'Copos', 'copos', array['Munchkin','Philips Avent','NUK','Buba']::text[], null::text, 'Copos de transicao para agua e sucos.', null::text, 3, 0, 0, 2::numeric, 'available'::public.gift_status, true, 25),
    ('passeio', 'Carrinho', 'carrinho', array['Galzerano','Burigotto','Safety 1st','Chicco']::text[], null::text, 'Carrinho confortavel e seguro para passeios.', 'Item de maior peso no progresso do enxoval.', 1, 0, 0, 15::numeric, 'available'::public.gift_status, true, 30),
    ('passeio', 'Bebe conforto', 'bebe-conforto', array['Burigotto','Galzerano','Safety 1st','Cosco']::text[], null::text, 'Bebe conforto certificado para transporte seguro.', null::text, 1, 0, 0, 12::numeric, 'available'::public.gift_status, true, 31),
    ('passeio', 'Cadeirinha automotiva', 'cadeirinha-automotiva', array['Safety 1st','Cosco','Chicco','Burigotto']::text[], null::text, 'Cadeirinha para etapas seguintes do crescimento.', null::text, 1, 0, 0, 12::numeric, 'available'::public.gift_status, true, 32),
    ('passeio', 'Bolsa maternidade', 'bolsa-maternidade', array['Lequiqui','Hug','Masterbag','Biro Baby']::text[], null::text, 'Bolsa maternidade elegante e funcional.', null::text, 1, 0, 0, 8::numeric, 'available'::public.gift_status, true, 33),
    ('desenvolvimento', 'Ginasio de atividades com piano', 'ginasio-de-atividades-com-piano', array['Fisher-Price','Buba','Tiny Love']::text[], null::text, 'Ginasio sensorial para estimular movimento e descobertas.', null::text, 1, 0, 0, 6::numeric, 'available'::public.gift_status, true, 40),
    ('desenvolvimento', 'Cubos sensoriais', 'cubos-sensoriais', array['Buba','Fisher-Price','Toyster']::text[], null::text, 'Cubos macios com texturas e estimulos.', null::text, 2, 0, 0, 2::numeric, 'available'::public.gift_status, true, 41),
    ('desenvolvimento', 'Livros de pano', 'livros-de-pano', array['Ciranda Cultural','Buba','Fisher-Price']::text[], null::text, 'Livrinhos seguros para leitura desde cedo.', null::text, 4, 0, 0, 2::numeric, 'available'::public.gift_status, true, 42),
    ('desenvolvimento', 'Mordedores', 'mordedores', array['Buba','MAM','Lillo','Chicco']::text[], null::text, 'Mordedores seguros para a fase oral.', null::text, 4, 0, 0, 2::numeric, 'available'::public.gift_status, true, 43),
    ('desenvolvimento', 'Chocalhos', 'chocalhos', array['Buba','Fisher-Price','Toyster','Chicco']::text[], null::text, 'Chocalhos leves para estimulo auditivo e motor.', null::text, 3, 0, 0, 2::numeric, 'available'::public.gift_status, true, 44),
    ('enxoval-atual', 'Fraldas RN adquiridas', 'fraldas-rn-adquiridas', array[]::text[], null::text, 'Item ja adquirido e considerado automaticamente no progresso inicial.', null::text, 20, 20, 0, 1::numeric, 'owned'::public.gift_status, false, 100),
    ('enxoval-atual', 'Fraldas P adquiridas', 'fraldas-p-adquiridas', array[]::text[], null::text, 'Item ja adquirido e considerado automaticamente no progresso inicial.', null::text, 20, 20, 0, 1::numeric, 'owned'::public.gift_status, false, 101),
    ('enxoval-atual', 'Kit berco adquirido', 'kit-berco-adquirido', array[]::text[], null::text, '2 travesseiros, 2 cobertores, 3 edredons, 4 lencois e 7 fronhas.', null::text, 18, 18, 0, 2::numeric, 'owned'::public.gift_status, false, 102),
    ('enxoval-atual', 'Kit moises adquirido', 'kit-moises-adquirido', array[]::text[], null::text, 'Colchao, 2 travesseiros, 4 lencois, 5 fronhas e capa.', null::text, 13, 13, 0, 2::numeric, 'owned'::public.gift_status, false, 103),
    ('enxoval-atual', 'Banho adquirido', 'banho-adquirido', array[]::text[], null::text, '2 toalhas, redinha e assento de banho.', null::text, 4, 4, 0, 3::numeric, 'owned'::public.gift_status, false, 104),
    ('enxoval-atual', 'Higiene adquirida', 'higiene-adquirida', array[]::text[], null::text, 'Colonia, escova, pente, aspirador nasal, escova de dedo, tesoura, cortador de unha e 3 lixas.', null::text, 11, 11, 0, 2::numeric, 'owned'::public.gift_status, false, 105),
    ('enxoval-atual', 'Tecidos adquiridos', 'tecidos-adquiridos', array[]::text[], null::text, '3 paninhos de boca, 5 fraldas de pano medias, 2 fraldas grandes e 2 fraldas de banho.', null::text, 12, 12, 0, 1::numeric, 'owned'::public.gift_status, false, 106),
    ('enxoval-atual', 'Outros itens adquiridos', 'outros-itens-adquiridos', array[]::text[], null::text, 'Naninha, cueiro, babadores bandana e sapatinhos.', null::text, 8, 8, 0, 1::numeric, 'owned'::public.gift_status, false, 107),
    ('enxoval-atual', 'Roupas adquiridas', 'roupas-adquiridas', array[]::text[], null::text, 'Muitas roupas RN, roupas P, roupas M e roupas G.', null::text, 80, 80, 0, 1::numeric, 'owned'::public.gift_status, false, 108)
) as v(
  category_slug,
  name,
  slug,
  suggested_brands,
  image_url,
  description,
  notes,
  quantity_needed,
  quantity_owned,
  quantity_reserved,
  progress_weight,
  status,
  is_public,
  display_order
)
join public.categories c on c.slug = v.category_slug
on conflict (slug) do update
set
  category_id = excluded.category_id,
  name = excluded.name,
  suggested_brands = excluded.suggested_brands,
  image_url = excluded.image_url,
  description = excluded.description,
  notes = excluded.notes,
  quantity_needed = excluded.quantity_needed,
  quantity_owned = excluded.quantity_owned,
  progress_weight = excluded.progress_weight,
  is_public = excluded.is_public,
  display_order = excluded.display_order;

-- Apos criar o usuario administrador no Supabase Auth, habilite o painel com:
-- insert into public.admin_profiles(user_id, email, display_name)
-- select id, email, 'Administrador'
-- from auth.users
-- where email = 'seu-email@exemplo.com'
-- on conflict (user_id) do nothing;

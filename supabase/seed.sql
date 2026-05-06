-- ═══════════════════════════════════════════════════════════════
-- SMVS Seva Management System — Comprehensive Demo Seed
-- ═══════════════════════════════════════════════════════════════
-- Run AFTER schema.sql in Supabase SQL Editor
--
-- ┌─────────────────────────────────────────────────────────────┐
-- │  DEMO LOGIN CREDENTIALS                                     │
-- │                                                             │
-- │  Super Admin   superadmin@smvs.org    Smvs@Demo2026        │
-- │  AHM Admin     admin.ahm@smvs.org     Smvs@Demo2026        │
-- │  SRT Admin     admin.srt@smvs.org     Smvs@Demo2026        │
-- │  MUM Admin     admin.mum@smvs.org     Smvs@Demo2026        │
-- │  RAJ Admin     admin.raj@smvs.org     Smvs@Demo2026        │
-- │                                                             │
-- │  Members login by Global ID:                               │
-- │  AHM001–AHM008  SRT001–SRT006                             │
-- │  MUM001–MUM005  RAJ001–RAJ004                             │
-- └─────────────────────────────────────────────────────────────┘
--
-- TO WIPE ALL DEMO DATA LATER (run in SQL Editor):
--   TRUNCATE seva_completions, seva_assignments, sevas,
--     seva_categories, members, admin_users, centers CASCADE;
--   DELETE FROM auth.identities WHERE provider = 'email'
--     AND identity_data->>'email' LIKE '%@smvs.org';
--   DELETE FROM auth.users WHERE email LIKE '%@smvs.org';
-- ═══════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- 1. CENTERS
-- ─────────────────────────────────────────────────────────────
INSERT INTO centers (id, name, location, admin_name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Ahmedabad Center', 'Ahmedabad, Gujarat',   'Bhagwandas Patel'),
  ('22222222-2222-2222-2222-222222222222', 'Surat Center',     'Surat, Gujarat',       'Nareshbhai Shah'),
  ('33333333-3333-3333-3333-333333333333', 'Mumbai Center',    'Mumbai, Maharashtra',  'Yogeshbhai Desai'),
  ('44444444-4444-4444-4444-444444444444', 'Rajkot Center',    'Rajkot, Gujarat',      'Harishbhai Vyas');

-- ─────────────────────────────────────────────────────────────
-- 2. AUTH USERS  (creates real login accounts)
-- ─────────────────────────────────────────────────────────────
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token,
  email_change, email_change_token_new, recovery_token
) VALUES
  ('00000000-0000-0000-0000-000000000000',
   'fa000001-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'superadmin@smvs.org',
   crypt('Smvs@Demo2026', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{}',
   NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000',
   'fa000002-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'admin.ahm@smvs.org',
   crypt('Smvs@Demo2026', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{}',
   NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000',
   'fa000003-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'admin.srt@smvs.org',
   crypt('Smvs@Demo2026', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{}',
   NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000',
   'fa000004-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'admin.mum@smvs.org',
   crypt('Smvs@Demo2026', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{}',
   NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000',
   'fa000005-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'admin.raj@smvs.org',
   crypt('Smvs@Demo2026', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{}',
   NOW(), NOW(), '', '', '', '');

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
) VALUES
  ('fa000001-0000-0000-0000-000000000000',
   'fa000001-0000-0000-0000-000000000000',
   '{"sub":"fa000001-0000-0000-0000-000000000000","email":"superadmin@smvs.org"}',
   'email', 'superadmin@smvs.org', NOW(), NOW(), NOW()),
  ('fa000002-0000-0000-0000-000000000000',
   'fa000002-0000-0000-0000-000000000000',
   '{"sub":"fa000002-0000-0000-0000-000000000000","email":"admin.ahm@smvs.org"}',
   'email', 'admin.ahm@smvs.org', NOW(), NOW(), NOW()),
  ('fa000003-0000-0000-0000-000000000000',
   'fa000003-0000-0000-0000-000000000000',
   '{"sub":"fa000003-0000-0000-0000-000000000000","email":"admin.srt@smvs.org"}',
   'email', 'admin.srt@smvs.org', NOW(), NOW(), NOW()),
  ('fa000004-0000-0000-0000-000000000000',
   'fa000004-0000-0000-0000-000000000000',
   '{"sub":"fa000004-0000-0000-0000-000000000000","email":"admin.mum@smvs.org"}',
   'email', 'admin.mum@smvs.org', NOW(), NOW(), NOW()),
  ('fa000005-0000-0000-0000-000000000000',
   'fa000005-0000-0000-0000-000000000000',
   '{"sub":"fa000005-0000-0000-0000-000000000000","email":"admin.raj@smvs.org"}',
   'email', 'admin.raj@smvs.org', NOW(), NOW(), NOW());

-- ─────────────────────────────────────────────────────────────
-- 3. ADMIN USERS  (links auth accounts to app roles)
-- ─────────────────────────────────────────────────────────────
INSERT INTO admin_users (id, role, center_id, name, email) VALUES
  ('fa000001-0000-0000-0000-000000000000', 'super_admin',  NULL,                                   'Super Admin',      'superadmin@smvs.org'),
  ('fa000002-0000-0000-0000-000000000000', 'center_admin', '11111111-1111-1111-1111-111111111111', 'Bhagwandas Patel', 'admin.ahm@smvs.org'),
  ('fa000003-0000-0000-0000-000000000000', 'center_admin', '22222222-2222-2222-2222-222222222222', 'Nareshbhai Shah',  'admin.srt@smvs.org'),
  ('fa000004-0000-0000-0000-000000000000', 'center_admin', '33333333-3333-3333-3333-333333333333', 'Yogeshbhai Desai', 'admin.mum@smvs.org'),
  ('fa000005-0000-0000-0000-000000000000', 'center_admin', '44444444-4444-4444-4444-444444444444', 'Harishbhai Vyas',  'admin.raj@smvs.org');

-- ─────────────────────────────────────────────────────────────
-- 4. MEMBERS
-- ─────────────────────────────────────────────────────────────
INSERT INTO members (global_id, name, phone, center_id, active) VALUES
  -- Ahmedabad — 8 members (AHM008 inactive to show that feature)
  ('AHM001', 'Rameshbhai Patel',     '9876541001', '11111111-1111-1111-1111-111111111111', TRUE),
  ('AHM002', 'Sureshbhai Shah',      '9876541002', '11111111-1111-1111-1111-111111111111', TRUE),
  ('AHM003', 'Dineshbhai Mehta',     '9876541003', '11111111-1111-1111-1111-111111111111', TRUE),
  ('AHM004', 'Prakashbhai Joshi',    '9876541004', '11111111-1111-1111-1111-111111111111', TRUE),
  ('AHM005', 'Maheshbhai Trivedi',   '9876541005', '11111111-1111-1111-1111-111111111111', TRUE),
  ('AHM006', 'Hiteshbhai Dave',      '9876541006', '11111111-1111-1111-1111-111111111111', TRUE),
  ('AHM007', 'Nileshbhai Bhatt',     '9876541007', '11111111-1111-1111-1111-111111111111', TRUE),
  ('AHM008', 'Jayeshbhai Pathak',    '9876541008', '11111111-1111-1111-1111-111111111111', FALSE),
  -- Surat — 6 members (SRT006 inactive)
  ('SRT001', 'Jagdishbhai Patel',    '9876542001', '22222222-2222-2222-2222-222222222222', TRUE),
  ('SRT002', 'Bharatbhai Modi',      '9876542002', '22222222-2222-2222-2222-222222222222', TRUE),
  ('SRT003', 'Nileshbhai Shah',      '9876542003', '22222222-2222-2222-2222-222222222222', TRUE),
  ('SRT004', 'Kamleshbhai Desai',    '9876542004', '22222222-2222-2222-2222-222222222222', TRUE),
  ('SRT005', 'Rajeshbhai Vora',      '9876542005', '22222222-2222-2222-2222-222222222222', TRUE),
  ('SRT006', 'Umeshbhai Kapadia',    '9876542006', '22222222-2222-2222-2222-222222222222', FALSE),
  -- Mumbai — 5 members
  ('MUM001', 'Harishbhai Thakkar',   '9876543001', '33333333-3333-3333-3333-333333333333', TRUE),
  ('MUM002', 'Vijaybhai Soni',       '9876543002', '33333333-3333-3333-3333-333333333333', TRUE),
  ('MUM003', 'Arunbhai Parmar',      '9876543003', '33333333-3333-3333-3333-333333333333', TRUE),
  ('MUM004', 'Deepakbhai Nair',      '9876543004', '33333333-3333-3333-3333-333333333333', TRUE),
  ('MUM005', 'Sanjaybhai Pillai',    '9876543005', '33333333-3333-3333-3333-333333333333', TRUE),
  -- Rajkot — 4 members
  ('RAJ001', 'Manishbhai Pandya',    '9876544001', '44444444-4444-4444-4444-444444444444', TRUE),
  ('RAJ002', 'Ashokbhai Bhatt',      '9876544002', '44444444-4444-4444-4444-444444444444', TRUE),
  ('RAJ003', 'Vikrambhai Rathod',    '9876544003', '44444444-4444-4444-4444-444444444444', TRUE),
  ('RAJ004', 'Chandrakantbhai Oza',  '9876544004', '44444444-4444-4444-4444-444444444444', TRUE);

-- ─────────────────────────────────────────────────────────────
-- 5. SEVA CATEGORIES
-- ─────────────────────────────────────────────────────────────
INSERT INTO seva_categories (id, center_id, name, description) VALUES
  -- Ahmedabad
  ('ca100001-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'Kitchen Seva',    'Prasad and food preparation for all sabhas'),
  ('ca100002-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'Hall Decoration', 'Decoration of sabha hall and mandap'),
  ('ca100003-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'Security Seva',   'Entry gate management and parking'),
  ('ca100004-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'Satsang Seva',    'Kirtan, parayan, and sabha arrangements'),
  -- Surat
  ('ca200001-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'Kitchen Seva',    'Daily prasad and special bhoj preparation'),
  ('ca200002-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'Cleaning Seva',   'Temple and hall cleaning and maintenance'),
  ('ca200003-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'Transport Seva',  'Pickup and drop for Sants and guests'),
  -- Mumbai
  ('ca300001-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'Kitchen Seva',    'Prasad and thaali seva'),
  ('ca300002-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'Media Seva',      'Live streaming, photography, and sound system'),
  ('ca300003-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'Satsang Seva',    'Kirtan and parayan arrangements'),
  -- Rajkot
  ('ca400001-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'Kitchen Seva',    'Daily prasad preparation and serving'),
  ('ca400002-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'Hall Seva',       'Sabha arrangements, decoration, and AV setup');

-- ─────────────────────────────────────────────────────────────
-- 6. SEVAS
-- ─────────────────────────────────────────────────────────────
INSERT INTO sevas (id, category_id, center_id, name, description, frequency, active) VALUES
  -- AHM Kitchen (9 sevas)
  ('da100001-0000-0000-0000-000000000000', 'ca100001-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'Morning Prasad',        'Prepare and serve morning prasad to all sevakaas',            'daily',    TRUE),
  ('da100002-0000-0000-0000-000000000000', 'ca100001-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'Evening Prasad',        'Prepare and serve evening prasad and dinner',                 'daily',    TRUE),
  ('da100003-0000-0000-0000-000000000000', 'ca100001-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'Ekadashi Fasting Bhoj', 'Special fasting menu on Ekadashi for all center members',    'monthly',  TRUE),
  -- AHM Decoration
  ('da100004-0000-0000-0000-000000000000', 'ca100002-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'Weekly Sabha Decoration','Flower and rangoli decoration for the weekly sabha hall',   'weekly',   TRUE),
  ('da100005-0000-0000-0000-000000000000', 'ca100002-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'Annakut Decoration',    'Annakut thal preparation and hall decoration',                'one-time', TRUE),
  -- AHM Security
  ('da100006-0000-0000-0000-000000000000', 'ca100003-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'Entry Gate Seva',       'Manage entry, footwear area, and devotee reception',          'daily',    TRUE),
  ('da100007-0000-0000-0000-000000000000', 'ca100003-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'Parking Management',    'Guide vehicles and manage parking area during sabha',         'weekly',   TRUE),
  -- AHM Satsang
  ('da100008-0000-0000-0000-000000000000', 'ca100004-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'Kirtan Seva',           'Harmonium and tabla for weekly satsang sabha',               'weekly',   TRUE),
  ('da100009-0000-0000-0000-000000000000', 'ca100004-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'Vishesh Sabha',         'Monthly special sabha arrangements and hospitality',         'monthly',  TRUE),
  -- SRT Kitchen
  ('da200001-0000-0000-0000-000000000000', 'ca200001-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   'Morning Prasad',        'Daily morning prasad preparation and distribution',           'daily',    TRUE),
  ('da200002-0000-0000-0000-000000000000', 'ca200001-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   'Roti Making Seva',      'Fresh rotis for all meals from 6am to 10am',                 'daily',    TRUE),
  -- SRT Cleaning
  ('da200003-0000-0000-0000-000000000000', 'ca200002-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   'Temple Cleaning',       'Daily temple floor, murti room, and corridor cleaning',      'daily',    TRUE),
  ('da200004-0000-0000-0000-000000000000', 'ca200002-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   'Hall Deep Cleaning',    'Weekly thorough cleaning of the entire sabha hall',          'weekly',   TRUE),
  -- SRT Transport
  ('da200005-0000-0000-0000-000000000000', 'ca200003-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   'Sant Pickup Seva',      'Airport and railway station pickup for visiting Sants',      'custom',   TRUE),
  -- MUM Kitchen
  ('da300001-0000-0000-0000-000000000000', 'ca300001-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   'Morning Prasad',        'Morning prasad and nashta arrangements for sevakaas',        'daily',    TRUE),
  ('da300002-0000-0000-0000-000000000000', 'ca300001-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   'Thaali Serving',        'Serve thaalis during sabha and special events',              'weekly',   TRUE),
  -- MUM Media
  ('da300003-0000-0000-0000-000000000000', 'ca300002-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   'Live Streaming',        'YouTube and Facebook live streaming of weekly sabha',        'weekly',   TRUE),
  ('da300004-0000-0000-0000-000000000000', 'ca300002-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   'Event Photography',     'Photo and video documentation of center events',             'one-time', TRUE),
  -- MUM Satsang
  ('da300005-0000-0000-0000-000000000000', 'ca300003-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   'Kirtan Seva',           'Kirtan and bhajan for weekly satsang sabha',                 'weekly',   TRUE),
  -- RAJ Kitchen
  ('da400001-0000-0000-0000-000000000000', 'ca400001-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444',
   'Daily Prasad',          'Morning and evening prasad preparation for center',          'daily',    TRUE),
  ('da400002-0000-0000-0000-000000000000', 'ca400001-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444',
   'Special Bhoj',          'Special bhoj on Ekadashi and festival days',                 'monthly',  TRUE),
  -- RAJ Hall
  ('da400003-0000-0000-0000-000000000000', 'ca400002-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444',
   'Sabha Arrangements',    'Chairs, mats, and audio setup for weekly sabha',             'weekly',   TRUE),
  ('da400004-0000-0000-0000-000000000000', 'ca400002-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444',
   'Janmashtami Decoration','Special decoration and thal for Janmashtami celebration',    'one-time', TRUE);

-- ─────────────────────────────────────────────────────────────
-- 7. SEVA ASSIGNMENTS
-- ─────────────────────────────────────────────────────────────
INSERT INTO seva_assignments (id, seva_id, member_id, center_id, role) VALUES
  -- AHM Morning Prasad
  ('ea100001-0000-0000-0000-000000000000', 'da100001-0000-0000-0000-000000000000', 'AHM001', '11111111-1111-1111-1111-111111111111', 'leader'),
  ('ea100002-0000-0000-0000-000000000000', 'da100001-0000-0000-0000-000000000000', 'AHM002', '11111111-1111-1111-1111-111111111111', 'member'),
  ('ea100003-0000-0000-0000-000000000000', 'da100001-0000-0000-0000-000000000000', 'AHM003', '11111111-1111-1111-1111-111111111111', 'member'),
  -- AHM Evening Prasad
  ('ea100004-0000-0000-0000-000000000000', 'da100002-0000-0000-0000-000000000000', 'AHM004', '11111111-1111-1111-1111-111111111111', 'leader'),
  ('ea100005-0000-0000-0000-000000000000', 'da100002-0000-0000-0000-000000000000', 'AHM005', '11111111-1111-1111-1111-111111111111', 'member'),
  -- AHM Ekadashi
  ('ea100006-0000-0000-0000-000000000000', 'da100003-0000-0000-0000-000000000000', 'AHM001', '11111111-1111-1111-1111-111111111111', 'leader'),
  ('ea100007-0000-0000-0000-000000000000', 'da100003-0000-0000-0000-000000000000', 'AHM006', '11111111-1111-1111-1111-111111111111', 'member'),
  -- AHM Sabha Decoration
  ('ea100008-0000-0000-0000-000000000000', 'da100004-0000-0000-0000-000000000000', 'AHM002', '11111111-1111-1111-1111-111111111111', 'leader'),
  ('ea100009-0000-0000-0000-000000000000', 'da100004-0000-0000-0000-000000000000', 'AHM007', '11111111-1111-1111-1111-111111111111', 'member'),
  -- AHM Annakut Decoration
  ('ea100010-0000-0000-0000-000000000000', 'da100005-0000-0000-0000-000000000000', 'AHM003', '11111111-1111-1111-1111-111111111111', 'leader'),
  ('ea100011-0000-0000-0000-000000000000', 'da100005-0000-0000-0000-000000000000', 'AHM004', '11111111-1111-1111-1111-111111111111', 'member'),
  ('ea100012-0000-0000-0000-000000000000', 'da100005-0000-0000-0000-000000000000', 'AHM005', '11111111-1111-1111-1111-111111111111', 'member'),
  -- AHM Entry Gate
  ('ea100013-0000-0000-0000-000000000000', 'da100006-0000-0000-0000-000000000000', 'AHM006', '11111111-1111-1111-1111-111111111111', 'leader'),
  ('ea100014-0000-0000-0000-000000000000', 'da100006-0000-0000-0000-000000000000', 'AHM007', '11111111-1111-1111-1111-111111111111', 'member'),
  -- AHM Parking
  ('ea100015-0000-0000-0000-000000000000', 'da100007-0000-0000-0000-000000000000', 'AHM005', '11111111-1111-1111-1111-111111111111', 'leader'),
  ('ea100016-0000-0000-0000-000000000000', 'da100007-0000-0000-0000-000000000000', 'AHM006', '11111111-1111-1111-1111-111111111111', 'member'),
  -- AHM Kirtan
  ('ea100017-0000-0000-0000-000000000000', 'da100008-0000-0000-0000-000000000000', 'AHM007', '11111111-1111-1111-1111-111111111111', 'leader'),
  ('ea100018-0000-0000-0000-000000000000', 'da100008-0000-0000-0000-000000000000', 'AHM001', '11111111-1111-1111-1111-111111111111', 'member'),
  -- AHM Vishesh Sabha
  ('ea100019-0000-0000-0000-000000000000', 'da100009-0000-0000-0000-000000000000', 'AHM002', '11111111-1111-1111-1111-111111111111', 'leader'),
  ('ea100020-0000-0000-0000-000000000000', 'da100009-0000-0000-0000-000000000000', 'AHM003', '11111111-1111-1111-1111-111111111111', 'member'),
  ('ea100021-0000-0000-0000-000000000000', 'da100009-0000-0000-0000-000000000000', 'AHM004', '11111111-1111-1111-1111-111111111111', 'member'),
  -- SRT Morning Prasad
  ('ea200001-0000-0000-0000-000000000000', 'da200001-0000-0000-0000-000000000000', 'SRT001', '22222222-2222-2222-2222-222222222222', 'leader'),
  ('ea200002-0000-0000-0000-000000000000', 'da200001-0000-0000-0000-000000000000', 'SRT002', '22222222-2222-2222-2222-222222222222', 'member'),
  ('ea200003-0000-0000-0000-000000000000', 'da200001-0000-0000-0000-000000000000', 'SRT003', '22222222-2222-2222-2222-222222222222', 'member'),
  -- SRT Roti Making
  ('ea200004-0000-0000-0000-000000000000', 'da200002-0000-0000-0000-000000000000', 'SRT003', '22222222-2222-2222-2222-222222222222', 'leader'),
  ('ea200005-0000-0000-0000-000000000000', 'da200002-0000-0000-0000-000000000000', 'SRT004', '22222222-2222-2222-2222-222222222222', 'member'),
  -- SRT Temple Cleaning
  ('ea200006-0000-0000-0000-000000000000', 'da200003-0000-0000-0000-000000000000', 'SRT002', '22222222-2222-2222-2222-222222222222', 'leader'),
  ('ea200007-0000-0000-0000-000000000000', 'da200003-0000-0000-0000-000000000000', 'SRT005', '22222222-2222-2222-2222-222222222222', 'member'),
  -- SRT Hall Deep Cleaning
  ('ea200008-0000-0000-0000-000000000000', 'da200004-0000-0000-0000-000000000000', 'SRT004', '22222222-2222-2222-2222-222222222222', 'leader'),
  ('ea200009-0000-0000-0000-000000000000', 'da200004-0000-0000-0000-000000000000', 'SRT005', '22222222-2222-2222-2222-222222222222', 'member'),
  -- SRT Sant Pickup
  ('ea200010-0000-0000-0000-000000000000', 'da200005-0000-0000-0000-000000000000', 'SRT001', '22222222-2222-2222-2222-222222222222', 'leader'),
  ('ea200011-0000-0000-0000-000000000000', 'da200005-0000-0000-0000-000000000000', 'SRT002', '22222222-2222-2222-2222-222222222222', 'member'),
  -- MUM Morning Prasad
  ('ea300001-0000-0000-0000-000000000000', 'da300001-0000-0000-0000-000000000000', 'MUM001', '33333333-3333-3333-3333-333333333333', 'leader'),
  ('ea300002-0000-0000-0000-000000000000', 'da300001-0000-0000-0000-000000000000', 'MUM002', '33333333-3333-3333-3333-333333333333', 'member'),
  ('ea300003-0000-0000-0000-000000000000', 'da300001-0000-0000-0000-000000000000', 'MUM003', '33333333-3333-3333-3333-333333333333', 'member'),
  -- MUM Thaali Serving
  ('ea300004-0000-0000-0000-000000000000', 'da300002-0000-0000-0000-000000000000', 'MUM003', '33333333-3333-3333-3333-333333333333', 'leader'),
  ('ea300005-0000-0000-0000-000000000000', 'da300002-0000-0000-0000-000000000000', 'MUM004', '33333333-3333-3333-3333-333333333333', 'member'),
  -- MUM Live Streaming
  ('ea300006-0000-0000-0000-000000000000', 'da300003-0000-0000-0000-000000000000', 'MUM004', '33333333-3333-3333-3333-333333333333', 'leader'),
  ('ea300007-0000-0000-0000-000000000000', 'da300003-0000-0000-0000-000000000000', 'MUM005', '33333333-3333-3333-3333-333333333333', 'member'),
  -- MUM Photography
  ('ea300008-0000-0000-0000-000000000000', 'da300004-0000-0000-0000-000000000000', 'MUM005', '33333333-3333-3333-3333-333333333333', 'leader'),
  -- MUM Kirtan
  ('ea300009-0000-0000-0000-000000000000', 'da300005-0000-0000-0000-000000000000', 'MUM001', '33333333-3333-3333-3333-333333333333', 'leader'),
  ('ea300010-0000-0000-0000-000000000000', 'da300005-0000-0000-0000-000000000000', 'MUM002', '33333333-3333-3333-3333-333333333333', 'member'),
  -- RAJ Daily Prasad
  ('ea400001-0000-0000-0000-000000000000', 'da400001-0000-0000-0000-000000000000', 'RAJ001', '44444444-4444-4444-4444-444444444444', 'leader'),
  ('ea400002-0000-0000-0000-000000000000', 'da400001-0000-0000-0000-000000000000', 'RAJ002', '44444444-4444-4444-4444-444444444444', 'member'),
  -- RAJ Special Bhoj
  ('ea400003-0000-0000-0000-000000000000', 'da400002-0000-0000-0000-000000000000', 'RAJ002', '44444444-4444-4444-4444-444444444444', 'leader'),
  ('ea400004-0000-0000-0000-000000000000', 'da400002-0000-0000-0000-000000000000', 'RAJ003', '44444444-4444-4444-4444-444444444444', 'member'),
  -- RAJ Sabha Arrangements
  ('ea400005-0000-0000-0000-000000000000', 'da400003-0000-0000-0000-000000000000', 'RAJ003', '44444444-4444-4444-4444-444444444444', 'leader'),
  ('ea400006-0000-0000-0000-000000000000', 'da400003-0000-0000-0000-000000000000', 'RAJ004', '44444444-4444-4444-4444-444444444444', 'member'),
  -- RAJ Janmashtami Decoration
  ('ea400007-0000-0000-0000-000000000000', 'da400004-0000-0000-0000-000000000000', 'RAJ001', '44444444-4444-4444-4444-444444444444', 'leader'),
  ('ea400008-0000-0000-0000-000000000000', 'da400004-0000-0000-0000-000000000000', 'RAJ002', '44444444-4444-4444-4444-444444444444', 'member'),
  ('ea400009-0000-0000-0000-000000000000', 'da400004-0000-0000-0000-000000000000', 'RAJ003', '44444444-4444-4444-4444-444444444444', 'member');

-- ─────────────────────────────────────────────────────────────
-- 8. SEVA COMPLETIONS
-- Shows: regular submissions, proof photos, admin remarks,
--        expired media, fresh media, 5 weeks of history.
--
-- proof_url uses picsum.photos — shows real placeholder images
--   in the UI without needing Cloudinary configured.
-- media_expires_at:
--   • NULL  = media already expired / not uploaded
--   • date  = still live (within 30 days of upload)
-- ─────────────────────────────────────────────────────────────

-- ── AHM Morning Prasad — AHM001 (leader) ────────────────────
INSERT INTO seva_completions
  (id, assignment_id, member_id, seva_id, center_id, completed_date,
   proof_url, proof_public_id, user_suchan, admin_remark, media_expires_at)
VALUES
  ('ba100001-0000-0000-0000-000000000000',
   'ea100001-0000-0000-0000-000000000000', 'AHM001',
   'da100001-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-04-28', NULL, NULL,
   'Prasad seva saras rahi. Badha santosht thaya.',
   NULL, NULL),

  ('ba100002-0000-0000-0000-000000000000',
   'ea100001-0000-0000-0000-000000000000', 'AHM001',
   'da100001-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-04-29',
   'https://picsum.photos/seed/ahm-prasad-1/600/400', 'smvs-seva/ahm/morning-prasad-20260429',
   'Aaj 65 sevakaas ne serve karya. Dal-bhaat-roti-shak banyu.',
   NULL, '2026-05-29 00:00:00+00'),

  ('ba100003-0000-0000-0000-000000000000',
   'ea100001-0000-0000-0000-000000000000', 'AHM001',
   'da100001-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-05-01', NULL, NULL,
   'Labour Day na din e bhi seva kari.',
   'Rameshbhai ni niyamit seva prashansaniya chhe. Khub sundar prasad banavy. Jai Swaminarayan 🙏',
   NULL),

  ('ba100004-0000-0000-0000-000000000000',
   'ea100001-0000-0000-0000-000000000000', 'AHM001',
   'da100001-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-05-02',
   'https://picsum.photos/seed/ahm-prasad-2/600/400', 'smvs-seva/ahm/morning-prasad-20260502',
   'Special mango shrikhand banyo aaj. Sab ne bahut gamyu.',
   NULL, '2026-06-01 00:00:00+00'),

  ('ba100005-0000-0000-0000-000000000000',
   'ea100001-0000-0000-0000-000000000000', 'AHM001',
   'da100001-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-05-05',
   'https://picsum.photos/seed/ahm-prasad-3/600/400', 'smvs-seva/ahm/morning-prasad-20260505',
   'Regular morning prasad. Sab saru rahu.',
   NULL, '2026-06-04 00:00:00+00');

-- ── AHM Morning Prasad — AHM002 & AHM003 (members) ──────────
INSERT INTO seva_completions
  (id, assignment_id, member_id, seva_id, center_id, completed_date,
   proof_url, proof_public_id, user_suchan, admin_remark, media_expires_at)
VALUES
  ('ba100006-0000-0000-0000-000000000000',
   'ea100002-0000-0000-0000-000000000000', 'AHM002',
   'da100001-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-04-29', NULL, NULL, 'Seva karyo. Team ne madad kari.', NULL, NULL),

  ('ba100007-0000-0000-0000-000000000000',
   'ea100002-0000-0000-0000-000000000000', 'AHM002',
   'da100001-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-05-01',
   'https://picsum.photos/seed/ahm-mem2-1/600/400', 'smvs-seva/ahm/morning-prasad-mem2-20260501',
   '10 baje thi 2 baje sudhi raho. Khaanu sari rite banyuu.',
   NULL, '2026-05-31 00:00:00+00'),

  ('ba100008-0000-0000-0000-000000000000',
   'ea100002-0000-0000-0000-000000000000', 'AHM002',
   'da100001-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-05-05', NULL, NULL, NULL, NULL, NULL),

  ('ba100009-0000-0000-0000-000000000000',
   'ea100003-0000-0000-0000-000000000000', 'AHM003',
   'da100001-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-04-30', NULL, NULL, 'Seva karyi.', NULL, NULL),

  ('ba100010-0000-0000-0000-000000000000',
   'ea100003-0000-0000-0000-000000000000', 'AHM003',
   'da100001-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-05-02', NULL, NULL, NULL, NULL, NULL);

-- ── AHM Kirtan Seva — 5 weeks (AHM007 leader, AHM001 member) ─
INSERT INTO seva_completions
  (id, assignment_id, member_id, seva_id, center_id, completed_date,
   proof_url, proof_public_id, user_suchan, admin_remark, media_expires_at)
VALUES
  ('ba100011-0000-0000-0000-000000000000',
   'ea100017-0000-0000-0000-000000000000', 'AHM007',
   'da100008-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-04-06', NULL, NULL, 'Kirtan 2 kalaak chalayu.', NULL, NULL),

  ('ba100012-0000-0000-0000-000000000000',
   'ea100017-0000-0000-0000-000000000000', 'AHM007',
   'da100008-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-04-13',
   'https://picsum.photos/seed/ahm-kirtan-1/600/400', 'smvs-seva/ahm/kirtan-20260413',
   'Navin bhajan practice kari ne perform karyu.',
   'Aaj no kirtan khub anand-daayi thayo. Nileshbhai no swar khub madhur hato. Hari Hari 🙏',
   NULL),

  ('ba100013-0000-0000-0000-000000000000',
   'ea100017-0000-0000-0000-000000000000', 'AHM007',
   'da100008-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-04-20', NULL, NULL,
   'Kirtan 2.5 kalaak chalayu. Badha jodaaya. Khub saras rahu.',
   NULL, NULL),

  ('ba100014-0000-0000-0000-000000000000',
   'ea100017-0000-0000-0000-000000000000', 'AHM007',
   'da100008-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-04-27',
   'https://picsum.photos/seed/ahm-kirtan-2/600/400', 'smvs-seva/ahm/kirtan-20260427',
   NULL, NULL, NULL),

  ('ba100015-0000-0000-0000-000000000000',
   'ea100017-0000-0000-0000-000000000000', 'AHM007',
   'da100008-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-05-04',
   'https://picsum.photos/seed/ahm-kirtan-3/600/400', 'smvs-seva/ahm/kirtan-20260504',
   'Vaishakh Ekadashi ni vishesh kirtan seva.',
   'Vaishakh na kirtan ni khoob sundar seva. Soothing and devotional. Sahu ne aanad aavyo. 🙏',
   '2026-06-03 00:00:00+00'),

  ('ba100016-0000-0000-0000-000000000000',
   'ea100018-0000-0000-0000-000000000000', 'AHM001',
   'da100008-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-04-20', NULL, NULL, 'Harmonium seva karyo.', NULL, NULL),

  ('ba100017-0000-0000-0000-000000000000',
   'ea100018-0000-0000-0000-000000000000', 'AHM001',
   'da100008-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-05-04', NULL, NULL, 'Tabla sahyog karyo. Khub saras rahu.', NULL, NULL);

-- ── AHM Weekly Sabha Decoration — 5 weeks ───────────────────
INSERT INTO seva_completions
  (id, assignment_id, member_id, seva_id, center_id, completed_date,
   proof_url, proof_public_id, user_suchan, admin_remark, media_expires_at)
VALUES
  ('ba100018-0000-0000-0000-000000000000',
   'ea100008-0000-0000-0000-000000000000', 'AHM002',
   'da100004-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-04-06', NULL, NULL, 'Basic decoration karyu.', NULL, NULL),

  ('ba100019-0000-0000-0000-000000000000',
   'ea100008-0000-0000-0000-000000000000', 'AHM002',
   'da100004-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-04-13',
   'https://picsum.photos/seed/ahm-decor-1/600/400', 'smvs-seva/ahm/decoration-20260413',
   'Marigold phool thi decoration. Rang-rangili rangoli banavi.',
   NULL, NULL),

  ('ba100020-0000-0000-0000-000000000000',
   'ea100008-0000-0000-0000-000000000000', 'AHM002',
   'da100004-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-04-20', NULL, NULL, 'Simple but elegant decoration.', NULL, NULL),

  ('ba100021-0000-0000-0000-000000000000',
   'ea100008-0000-0000-0000-000000000000', 'AHM002',
   'da100004-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-04-27',
   'https://picsum.photos/seed/ahm-decor-2/600/400', 'smvs-seva/ahm/decoration-20260427',
   'Special Hanuman Jayanti decoration. Extra effort this week.',
   'Hall decoration khub sundar hati. Muktanand Swami prasanna thaya hoi. Sureshbhai ne salam. 🙏',
   NULL),

  ('ba100022-0000-0000-0000-000000000000',
   'ea100008-0000-0000-0000-000000000000', 'AHM002',
   'da100004-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-05-04',
   'https://picsum.photos/seed/ahm-decor-3/600/400', 'smvs-seva/ahm/decoration-20260504',
   NULL, NULL, '2026-06-03 00:00:00+00');

-- ── AHM Entry Gate — AHM006 ───────────────────────────────────
INSERT INTO seva_completions
  (id, assignment_id, member_id, seva_id, center_id, completed_date,
   proof_url, proof_public_id, user_suchan, admin_remark, media_expires_at)
VALUES
  ('ba100023-0000-0000-0000-000000000000',
   'ea100013-0000-0000-0000-000000000000', 'AHM006',
   'da100006-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-04-28', NULL, NULL, 'Gate seva 6am thi 10am sudhi.', NULL, NULL),

  ('ba100024-0000-0000-0000-000000000000',
   'ea100013-0000-0000-0000-000000000000', 'AHM006',
   'da100006-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-05-01',
   'https://picsum.photos/seed/ahm-gate-1/600/400', 'smvs-seva/ahm/entry-gate-20260501',
   '120 devotees aavya. Sundar vyavastha rahi.',
   NULL, '2026-05-31 00:00:00+00'),

  ('ba100025-0000-0000-0000-000000000000',
   'ea100013-0000-0000-0000-000000000000', 'AHM006',
   'da100006-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-05-05', NULL, NULL, NULL, NULL, NULL);

-- ── AHM Ekadashi Bhoj — monthly ──────────────────────────────
INSERT INTO seva_completions
  (id, assignment_id, member_id, seva_id, center_id, completed_date,
   proof_url, proof_public_id, user_suchan, admin_remark, media_expires_at)
VALUES
  ('ba100026-0000-0000-0000-000000000000',
   'ea100006-0000-0000-0000-000000000000', 'AHM001',
   'da100003-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-04-08',
   'https://picsum.photos/seed/ahm-ekadashi-1/600/400', 'smvs-seva/ahm/ekadashi-20260408',
   'Fasting bhoj for 80 members. Sabudana khichdi, fruits, tea.',
   'Ekadashi no prasad khub saras banyo. Sarvane tript karya. Rameshbhai ni team ne khub abhinandan. 🙏',
   NULL);

-- ── AHM Evening Prasad — AHM004 ──────────────────────────────
INSERT INTO seva_completions
  (id, assignment_id, member_id, seva_id, center_id, completed_date,
   proof_url, proof_public_id, user_suchan, admin_remark, media_expires_at)
VALUES
  ('ba100027-0000-0000-0000-000000000000',
   'ea100004-0000-0000-0000-000000000000', 'AHM004',
   'da100002-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-04-29', NULL, NULL,
   'Dinner for 90 sevakaas. Roti, shak, khichdi.', NULL, NULL),

  ('ba100028-0000-0000-0000-000000000000',
   'ea100004-0000-0000-0000-000000000000', 'AHM004',
   'da100002-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-05-02',
   'https://picsum.photos/seed/ahm-eve-1/600/400', 'smvs-seva/ahm/evening-prasad-20260502',
   NULL, NULL, '2026-06-01 00:00:00+00'),

  ('ba100029-0000-0000-0000-000000000000',
   'ea100004-0000-0000-0000-000000000000', 'AHM004',
   'da100002-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-05-05', NULL, NULL, NULL, NULL, NULL);

-- ── AHM Vishesh Sabha — monthly ───────────────────────────────
INSERT INTO seva_completions
  (id, assignment_id, member_id, seva_id, center_id, completed_date,
   proof_url, proof_public_id, user_suchan, admin_remark, media_expires_at)
VALUES
  ('ba100030-0000-0000-0000-000000000000',
   'ea100019-0000-0000-0000-000000000000', 'AHM002',
   'da100009-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   '2026-04-01',
   'https://picsum.photos/seed/ahm-vishesh-1/600/400', 'smvs-seva/ahm/vishesh-sabha-20260401',
   'April vishesh sabha. 200 members attended. Sab vyavastha first class.',
   'Vishesh sabha khub sundar rahi. Arrangements ekdam first class hata. Sureshbhai ni poori team ne khub abhinandan. Hari Hari 🙏',
   NULL);

-- ═════════════════════ SURAT ═════════════════════════════════

-- ── SRT Morning Prasad ───────────────────────────────────────
INSERT INTO seva_completions
  (id, assignment_id, member_id, seva_id, center_id, completed_date,
   proof_url, proof_public_id, user_suchan, admin_remark, media_expires_at)
VALUES
  ('ba200001-0000-0000-0000-000000000000',
   'ea200001-0000-0000-0000-000000000000', 'SRT001',
   'da200001-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   '2026-04-28', NULL, NULL, 'Niyamit seva karyi.', NULL, NULL),

  ('ba200002-0000-0000-0000-000000000000',
   'ea200001-0000-0000-0000-000000000000', 'SRT001',
   'da200001-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   '2026-04-29',
   'https://picsum.photos/seed/srt-prasad-1/600/400', 'smvs-seva/srt/morning-prasad-20260429',
   'Dahi vada banaya. Sab ne gamyu.',
   NULL, NULL),

  ('ba200003-0000-0000-0000-000000000000',
   'ea200001-0000-0000-0000-000000000000', 'SRT001',
   'da200001-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   '2026-05-01', NULL, NULL, NULL, NULL, NULL),

  ('ba200004-0000-0000-0000-000000000000',
   'ea200001-0000-0000-0000-000000000000', 'SRT001',
   'da200001-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   '2026-05-05',
   'https://picsum.photos/seed/srt-prasad-2/600/400', 'smvs-seva/srt/morning-prasad-20260505',
   '75 sevakaas ne serve karya.',
   'Surat center no prasad khub famous chhe. Jagdishbhai ni team ne abhinandan. Prasad ni quality ekdam umdaa. 🙏',
   '2026-06-04 00:00:00+00'),

  ('ba200005-0000-0000-0000-000000000000',
   'ea200002-0000-0000-0000-000000000000', 'SRT002',
   'da200001-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   '2026-04-29', NULL, NULL, 'Team ne sahyog karyo.', NULL, NULL),

  ('ba200006-0000-0000-0000-000000000000',
   'ea200002-0000-0000-0000-000000000000', 'SRT002',
   'da200001-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   '2026-05-01', NULL, NULL, NULL, NULL, NULL);

-- ── SRT Temple Cleaning ───────────────────────────────────────
INSERT INTO seva_completions
  (id, assignment_id, member_id, seva_id, center_id, completed_date,
   proof_url, proof_public_id, user_suchan, admin_remark, media_expires_at)
VALUES
  ('ba200007-0000-0000-0000-000000000000',
   'ea200006-0000-0000-0000-000000000000', 'SRT002',
   'da200003-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   '2026-04-28',
   'https://picsum.photos/seed/srt-clean-1/600/400', 'smvs-seva/srt/temple-cleaning-20260428',
   'Mandir cleaning 5am thi 8am sudhi. Sab chamaktu karyu.',
   NULL, NULL),

  ('ba200008-0000-0000-0000-000000000000',
   'ea200006-0000-0000-0000-000000000000', 'SRT002',
   'da200003-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   '2026-05-01', NULL, NULL, 'Niyamit safai kari.', NULL, NULL),

  ('ba200009-0000-0000-0000-000000000000',
   'ea200006-0000-0000-0000-000000000000', 'SRT002',
   'da200003-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   '2026-05-05', NULL, NULL, NULL,
   'Mandir safai khub sundar rahi. Murti room chamakti hati. Bhagwan prasanna. 🙏',
   NULL);

-- ── SRT Hall Deep Cleaning — weekly ──────────────────────────
INSERT INTO seva_completions
  (id, assignment_id, member_id, seva_id, center_id, completed_date,
   proof_url, proof_public_id, user_suchan, admin_remark, media_expires_at)
VALUES
  ('ba200010-0000-0000-0000-000000000000',
   'ea200008-0000-0000-0000-000000000000', 'SRT004',
   'da200004-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   '2026-04-06', NULL, NULL, 'Weekly deep cleaning karyi.', NULL, NULL),

  ('ba200011-0000-0000-0000-000000000000',
   'ea200008-0000-0000-0000-000000000000', 'SRT004',
   'da200004-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   '2026-04-13',
   'https://picsum.photos/seed/srt-hallclean-1/600/400', 'smvs-seva/srt/hall-cleaning-20260413',
   'Deep cleaning with 4 sevakaas. Fans, lights, walls sab saf karya.',
   NULL, NULL),

  ('ba200012-0000-0000-0000-000000000000',
   'ea200008-0000-0000-0000-000000000000', 'SRT004',
   'da200004-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   '2026-04-27', NULL, NULL, NULL, NULL, NULL),

  ('ba200013-0000-0000-0000-000000000000',
   'ea200008-0000-0000-0000-000000000000', 'SRT004',
   'da200004-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   '2026-05-04',
   'https://picsum.photos/seed/srt-hallclean-2/600/400', 'smvs-seva/srt/hall-cleaning-20260504',
   NULL, NULL, '2026-06-03 00:00:00+00');

-- ═════════════════════ MUMBAI ════════════════════════════════

-- ── MUM Morning Prasad ────────────────────────────────────────
INSERT INTO seva_completions
  (id, assignment_id, member_id, seva_id, center_id, completed_date,
   proof_url, proof_public_id, user_suchan, admin_remark, media_expires_at)
VALUES
  ('ba300001-0000-0000-0000-000000000000',
   'ea300001-0000-0000-0000-000000000000', 'MUM001',
   'da300001-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   '2026-04-28', NULL, NULL, 'Morning prasad seva karyi.', NULL, NULL),

  ('ba300002-0000-0000-0000-000000000000',
   'ea300001-0000-0000-0000-000000000000', 'MUM001',
   'da300001-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   '2026-04-30',
   'https://picsum.photos/seed/mum-prasad-1/600/400', 'smvs-seva/mum/morning-prasad-20260430',
   'Puran poli banavi aaj. Special Mumbai style. 55 sevakaas khush.',
   NULL, NULL),

  ('ba300003-0000-0000-0000-000000000000',
   'ea300001-0000-0000-0000-000000000000', 'MUM001',
   'da300001-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   '2026-05-04', NULL, NULL, 'Regular seva. Sab theek.',
   'Mumbai center no prasad khub saras bane chhe. Harishbhai team ne salam. Keep it up. 🙏',
   NULL),

  ('ba300004-0000-0000-0000-000000000000',
   'ea300002-0000-0000-0000-000000000000', 'MUM002',
   'da300001-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   '2026-04-30', NULL, NULL, '2 kalaak seva kari. Dish washing bhi karyu.', NULL, NULL),

  ('ba300005-0000-0000-0000-000000000000',
   'ea300002-0000-0000-0000-000000000000', 'MUM002',
   'da300001-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   '2026-05-04', NULL, NULL, NULL, NULL, NULL);

-- ── MUM Live Streaming — 5 weeks ─────────────────────────────
INSERT INTO seva_completions
  (id, assignment_id, member_id, seva_id, center_id, completed_date,
   proof_url, proof_public_id, user_suchan, admin_remark, media_expires_at)
VALUES
  ('ba300006-0000-0000-0000-000000000000',
   'ea300006-0000-0000-0000-000000000000', 'MUM004',
   'da300003-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   '2026-04-06',
   'https://picsum.photos/seed/mum-stream-1/600/400', 'smvs-seva/mum/live-stream-20260406',
   'Live stream 180 viewers. YouTube + Facebook simultaneously.',
   NULL, NULL),

  ('ba300007-0000-0000-0000-000000000000',
   'ea300006-0000-0000-0000-000000000000', 'MUM004',
   'da300003-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   '2026-04-13',
   'https://picsum.photos/seed/mum-stream-2/600/400', 'smvs-seva/mum/live-stream-20260413',
   '250 viewers peak. New streaming setup tested.',
   'Aaj no live stream khub saras raho. 250+ viewers aavya. Technology no sundar upyog. Deepakbhai ne abhinandan. 🙏',
   NULL),

  ('ba300008-0000-0000-0000-000000000000',
   'ea300006-0000-0000-0000-000000000000', 'MUM004',
   'da300003-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   '2026-04-20',
   'https://picsum.photos/seed/mum-stream-3/600/400', 'smvs-seva/mum/live-stream-20260420',
   'Stream quality upgraded to 1080p. Viewers loved it.',
   NULL, NULL),

  ('ba300009-0000-0000-0000-000000000000',
   'ea300006-0000-0000-0000-000000000000', 'MUM004',
   'da300003-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   '2026-04-27', NULL, NULL,
   'Minor internet issues but managed. 150 viewers.',
   NULL, NULL),

  ('ba300010-0000-0000-0000-000000000000',
   'ea300006-0000-0000-0000-000000000000', 'MUM004',
   'da300003-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   '2026-05-04',
   'https://picsum.photos/seed/mum-stream-4/600/400', 'smvs-seva/mum/live-stream-20260504',
   'Best stream this month! 320 viewers. New record!',
   'Record breaking viewership this week! 320+ viewers. Excellent technical execution. Deepakbhai ni poori team ne khub abhinandan. 🙏',
   '2026-06-03 00:00:00+00'),

  ('ba300011-0000-0000-0000-000000000000',
   'ea300007-0000-0000-0000-000000000000', 'MUM005',
   'da300003-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   '2026-04-13', NULL, NULL, 'Camera man seva karyu.', NULL, NULL),

  ('ba300012-0000-0000-0000-000000000000',
   'ea300007-0000-0000-0000-000000000000', 'MUM005',
   'da300003-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   '2026-05-04', NULL, NULL, 'Backup camera operated.', NULL, NULL);

-- ── MUM Kirtan — weekly ───────────────────────────────────────
INSERT INTO seva_completions
  (id, assignment_id, member_id, seva_id, center_id, completed_date,
   proof_url, proof_public_id, user_suchan, admin_remark, media_expires_at)
VALUES
  ('ba300013-0000-0000-0000-000000000000',
   'ea300009-0000-0000-0000-000000000000', 'MUM001',
   'da300005-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   '2026-04-06', NULL, NULL, 'Kirtan sabha saras rahi.', NULL, NULL),

  ('ba300014-0000-0000-0000-000000000000',
   'ea300009-0000-0000-0000-000000000000', 'MUM001',
   'da300005-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   '2026-04-13', NULL, NULL,
   'Ramnavami special kirtan. New bhajans.',
   'Kirtan no anand leedhho. Harishbhai no voice khub madhur aur bhakti-pur. 🙏',
   NULL),

  ('ba300015-0000-0000-0000-000000000000',
   'ea300009-0000-0000-0000-000000000000', 'MUM001',
   'da300005-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   '2026-04-27',
   'https://picsum.photos/seed/mum-kirtan-1/600/400', 'smvs-seva/mum/kirtan-20260427',
   'New bhajan practice and performed for first time.',
   NULL, NULL);

-- ═════════════════════ RAJKOT ════════════════════════════════

-- ── RAJ Daily Prasad ─────────────────────────────────────────
INSERT INTO seva_completions
  (id, assignment_id, member_id, seva_id, center_id, completed_date,
   proof_url, proof_public_id, user_suchan, admin_remark, media_expires_at)
VALUES
  ('ba400001-0000-0000-0000-000000000000',
   'ea400001-0000-0000-0000-000000000000', 'RAJ001',
   'da400001-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444',
   '2026-04-28', NULL, NULL, 'Daily prasad seva karyo.', NULL, NULL),

  ('ba400002-0000-0000-0000-000000000000',
   'ea400001-0000-0000-0000-000000000000', 'RAJ001',
   'da400001-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444',
   '2026-05-01',
   'https://picsum.photos/seed/raj-prasad-1/600/400', 'smvs-seva/raj/prasad-20260501',
   'Mathia nu prasad banyu aaj. Sab khush thaya.',
   NULL, '2026-05-31 00:00:00+00'),

  ('ba400003-0000-0000-0000-000000000000',
   'ea400001-0000-0000-0000-000000000000', 'RAJ001',
   'da400001-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444',
   '2026-05-05', NULL, NULL, NULL, NULL, NULL),

  ('ba400004-0000-0000-0000-000000000000',
   'ea400002-0000-0000-0000-000000000000', 'RAJ002',
   'da400001-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444',
   '2026-05-01', NULL, NULL, 'Sahyog karyo.', NULL, NULL);

-- ── RAJ Sabha Arrangements — weekly ──────────────────────────
INSERT INTO seva_completions
  (id, assignment_id, member_id, seva_id, center_id, completed_date,
   proof_url, proof_public_id, user_suchan, admin_remark, media_expires_at)
VALUES
  ('ba400005-0000-0000-0000-000000000000',
   'ea400005-0000-0000-0000-000000000000', 'RAJ003',
   'da400003-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444',
   '2026-04-13', NULL, NULL, 'Sabha arrangement karyu.', NULL, NULL),

  ('ba400006-0000-0000-0000-000000000000',
   'ea400005-0000-0000-0000-000000000000', 'RAJ003',
   'da400003-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444',
   '2026-04-20',
   'https://picsum.photos/seed/raj-sabha-1/600/400', 'smvs-seva/raj/sabha-20260420',
   '200 chairs lagavya. AC saru chalu rakhyu. Sound check karyu.',
   NULL, NULL),

  ('ba400007-0000-0000-0000-000000000000',
   'ea400005-0000-0000-0000-000000000000', 'RAJ003',
   'da400003-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444',
   '2026-04-27', NULL, NULL, NULL, NULL, NULL),

  ('ba400008-0000-0000-0000-000000000000',
   'ea400005-0000-0000-0000-000000000000', 'RAJ003',
   'da400003-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444',
   '2026-05-04',
   'https://picsum.photos/seed/raj-sabha-2/600/400', 'smvs-seva/raj/sabha-20260504',
   'Excellent setup this week.',
   'Sabha ni taiyari khub saras hati. Rajkot center ni team ne salam. Discipline aur dedication dono saras. 🙏',
   '2026-06-03 00:00:00+00'),

  ('ba400009-0000-0000-0000-000000000000',
   'ea400006-0000-0000-0000-000000000000', 'RAJ004',
   'da400003-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444',
   '2026-04-27', NULL, NULL, 'Sound system setup karyu.', NULL, NULL),

  ('ba400010-0000-0000-0000-000000000000',
   'ea400006-0000-0000-0000-000000000000', 'RAJ004',
   'da400003-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444',
   '2026-05-04', NULL, NULL, 'AV setup and testing karyu.', NULL, NULL);

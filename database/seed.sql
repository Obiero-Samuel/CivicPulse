-- ============================================================
--  CivicPulse — Seed Data
--  Real Nairobi wards, subcounties, authorities & test users
--  Sprint 2 — Database Setup
-- ============================================================

-- ─── Clean before re-seeding ─────────────────────────────────
TRUNCATE report_status_history, upvotes, reports, categories,
				 authorities, wards, users RESTART IDENTITY CASCADE;


-- ════════════════════════════════════════════════════════════
--  WARDS — Nairobi County (representative sample, 17 wards)
-- ════════════════════════════════════════════════════════════
INSERT INTO wards (name, subcounty, constituency, latitude, longitude) VALUES
	('Westlands',          'Westlands',      'Westlands',        -1.2676,  36.8033),
	('Parklands/Highridge','Westlands',      'Westlands',        -1.2588,  36.8195),
	('Karura',             'Westlands',      'Westlands',        -1.2317,  36.8142),
	('Kilimani',           'Dagoretti North','Kilimani',         -1.2921,  36.7882),
	('Kawangware',         'Dagoretti North','Kawangware',       -1.2780,  36.7393),
	('Woodley/Kenyatta',   'Dagoretti South','Dagoretti South',  -1.3050,  36.7700),
	('Kibera',             'Langata',        'Kibera',           -1.3133,  36.7872),
	('Karen',              'Langata',        'Langata',          -1.3382,  36.7127),
	('Nairobi West',       'Langata',        'Langata',          -1.3167,  36.8167),
	('Embakasi Central',   'Embakasi Central','Embakasi Central',-1.3167,  36.9167),
	('Umoja',              'Embakasi West',  'Embakasi West',    -1.2833,  36.8833),
	('Dandora',            'Embakasi North', 'Embakasi North',   -1.2500,  36.9000),
	('Kasarani',           'Kasarani',       'Kasarani',         -1.2217,  36.8983),
	('Roysambu',           'Kasarani',       'Roysambu',         -1.2167,  36.8667),
	('Zimmerman',          'Kasarani',       'Roysambu',         -1.2050,  36.8933),
	('Mathare',            'Mathare',        'Mathare',          -1.2578,  36.8583),
	('Starehe',            'Starehe',        'Starehe',          -1.2833,  36.8333);


-- ════════════════════════════════════════════════════════════
--  AUTHORITIES — Government bodies handling civic issues
-- ════════════════════════════════════════════════════════════
INSERT INTO authorities (name, description, contact_email) VALUES
	(
		'Nairobi City Water & Sewerage Company',
		'Manages water supply, sewerage, and drainage infrastructure across Nairobi County.',
		'complaints@nairobiwater.co.ke'
	),
	(
		'Kenya Urban Roads Authority (KURA)',
		'Responsible for development and maintenance of urban public roads within Nairobi.',
		'info@kura.go.ke'
	),
	(
		'Kenya Power & Lighting Company (KPLC)',
		'Manages electricity distribution, streetlighting, and power outage response in Nairobi.',
		'customercare@kplc.co.ke'
	),
	(
		'Nairobi City County — Public Health',
		'Handles garbage collection, sanitation enforcement, and public health inspections.',
		'publichealth@nairobi.go.ke'
	),
	(
		'Nairobi City County — Environment',
		'Oversees environmental compliance, illegal dumping, and green space management.',
		'environment@nairobi.go.ke'
	),
	(
		'National Construction Authority (NCA)',
		'Regulates construction activity, handles illegal structures and unsafe building reports.',
		'info@nca.go.ke'
	),
	(
		'Nairobi Metropolitan Services (NMS)',
		'Coordinates infrastructure projects, public works, and inter-agency civic operations.',
		'info@nms.go.ke'
	);


-- ════════════════════════════════════════════════════════════
--  CATEGORIES — Issue types mapped to responsible authority
-- ════════════════════════════════════════════════════════════
INSERT INTO categories (name, description, authority_id) VALUES
	-- Nairobi Water (id=1)
	('Burst Pipe',            'Visible water pipe bursts or leaks on public roads or estates.',          1),
	('Water Outage',          'Ward-wide or estate-level loss of water supply.',                         1),
	('Blocked Sewer',         'Overflowing or blocked sewerage lines causing public health risk.',        1),
	('Flooded Drainage',      'Blocked or collapsed drainage channels causing flooding.',                1),

	-- KURA (id=2)
	('Pothole',               'Road surface damage posing risk to vehicles and pedestrians.',            2),
	('Broken Pavement',       'Damaged or missing pedestrian walkways and kerbs.',                      2),
	('Road Flooding',         'Roads rendered impassable due to poor drainage or runoff.',              2),
	('Missing Road Signage',  'Absent or vandalised road signs, speed limits, or traffic markings.',    2),

	-- KPLC (id=3)
	('Street Light Out',      'Non-functional public streetlight creating safety hazard at night.',      3),
	('Power Outage',          'Unplanned electricity outage affecting a street or estate.',              3),
	('Exposed Wiring',        'Dangerous exposed electrical cables posing electrocution risk.',          3),

	-- Public Health (id=4)
	('Garbage Overflow',      'Overflowing public bins or uncollected garbage in a public area.',        4),
	('Illegal Dumping',       'Waste dumped in non-designated areas including roadsides or rivers.',     4),
	('Stagnant Water',        'Pools of stagnant water creating breeding grounds for mosquitoes.',       4),

	-- Environment (id=5)
	('Deforestation',         'Illegal tree cutting or clearing of public green spaces.',                5),
	('Air Pollution',         'Excessive smoke, industrial emissions, or burning of waste.',             5),

	-- NCA (id=6)
	('Illegal Construction',  'Unapproved building activity on public or private land.',                6),
	('Unsafe Structure',      'Building or wall at risk of collapse posing danger to the public.',      6),

	-- NMS (id=7)
	('Public Facility Damage','Damage to public parks, benches, bus stops, or community facilities.',   7),
	('Other',                 'Civic issues not covered by existing categories.',                        7);


-- ════════════════════════════════════════════════════════════
--  USERS — Test accounts (passwords are hashed "password123")
--  bcrypt hash of "password123", cost factor 10
-- ════════════════════════════════════════════════════════════
INSERT INTO users (full_name, email, password_hash, role, ward_id) VALUES
	(
		'Admin Sam',
		'admin@civicpulse.co.ke',
		'$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
		'admin',
		NULL
	),
	(
		'Officer Kamau',
		'officer@civicpulse.co.ke',
		'$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
		'officer',
		NULL
	),
	(
		'Aisha Resident',
		'resident@civicpulse.co.ke',
		'$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
		'resident',
		7   -- Kibera ward
	),
	(
		'Brian Otieno',
		'brian@civicpulse.co.ke',
		'$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
		'resident',
		11  -- Umoja ward
	),
	(
		'Grace Wanjiku',
		'grace@civicpulse.co.ke',
		'$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
		'resident',
		13  -- Kasarani ward
	);


-- ════════════════════════════════════════════════════════════
--  SAMPLE REPORTS — 3 realistic Nairobi civic reports
-- ════════════════════════════════════════════════════════════
INSERT INTO reports
	(tracking_number, title, description, category_id, ward_id, resident_id, assigned_to, status, latitude, longitude)
VALUES
	(
		'CP-2026-00001',
		'Large pothole on Kibera Drive near junction',
		'There is a very large pothole at the junction of Kibera Drive and Olympic Estate road. It has caused two motorbike accidents this week and is getting worse with the rains.',
		5,   -- Pothole → KURA
		7,   -- Kibera
		3,   -- Aisha
		2,   -- KURA
		'submitted',
		-1.3145, 36.7891
	),
	(
		'CP-2026-00002',
		'Street lights out along Umoja 1 estate road',
		'All six street lights along the main road in Umoja 1 have been out for three weeks. The area is very dark at night and residents fear for their safety.',
		9,   -- Street Light Out → KPLC
		11,  -- Umoja
		4,   -- Brian
		3,   -- KPLC
		'under_review',
		-1.2841, 36.8852
	),
	(
		'CP-2026-00003',
		'Garbage overflow at Kasarani market',
		'The public garbage collection point at Kasarani market has not been emptied in two weeks. Waste is spilling onto the road and the smell is unbearable.',
		12,  -- Garbage Overflow → Public Health
		13,  -- Kasarani
		5,   -- Grace
		4,   -- Public Health
		'in_progress',
		-1.2230, 36.8971
	);


-- ════════════════════════════════════════════════════════════
--  STATUS HISTORY — audit trail for the sample reports
-- ════════════════════════════════════════════════════════════
INSERT INTO report_status_history (report_id, changed_by, old_status, new_status, note) VALUES
	(2, 2, 'submitted',    'under_review', 'Report received and assigned to KPLC field team for assessment.'),
	(3, 2, 'submitted',    'under_review', 'Logged and forwarded to Public Health enforcement unit.'),
	(3, 2, 'under_review', 'in_progress',  'Collection truck scheduled for Friday 18 April 2026.');

-- ============================================================
--  CivicPulse — Seed Data
--  Real Nairobi wards, subcounties, authorities & test users
--  Sprint 2 — Database Setup
--  Updated: 16 Apr 2026 — aligned to match schema changes
-- ============================================================

-- ─── Clean before re-seeding ─────────────────────────────────
TRUNCATE report_status_history, upvotes, reports, categories,
                 authorities, wards, users RESTART IDENTITY CASCADE;

-- Reset tracking number sequence
ALTER SEQUENCE report_tracking_seq RESTART WITH 10001;


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
    ('Blocked Sewer',         'Overflowing or blocked sewerage lines causing public health risk.',       1),
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
        'info@kura.go.ke',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'authority_officer',
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
--  (tracking_number auto-generated by trigger)
-- ════════════════════════════════════════════════════════════
INSERT INTO reports
    (id, title, description, category_id, ward_id, user_id, authority_id, status, address, latitude, longitude)
VALUES
    (1,
        'Large pothole on Kibera Drive near junction',
        'There is a very large pothole at the junction of Kibera Drive and Olympic Estate road. It has caused two motorbike accidents this week and is getting worse with the rains.',
        5,   -- Pothole → KURA
        7,   -- Kibera
        3,   -- Aisha
        2,   -- KURA
        'open',
        'Kibera Drive junction, Olympic Estate',
        -1.3145, 36.7891
    ),
    (2,
        'Street lights out along Umoja 1 estate road',
        'All six street lights along the main road in Umoja 1 have been out for three weeks. The area is very dark at night and residents fear for their safety.',
        9,   -- Street Light Out → KPLC
        11,  -- Umoja
        4,   -- Brian
        3,   -- KPLC
        'in_progress',
        'Main road, Umoja 1 Estate',
        -1.2841, 36.8852
    ),
    (3,
        'Garbage overflow at Kasarani market',
        'The public garbage collection point at Kasarani market has not been emptied in two weeks. Waste is spilling onto the road and the smell is unbearable.',
        12,  -- Garbage Overflow → Public Health
        13,  -- Kasarani
        5,   -- Grace
        4,   -- Public Health
        'in_progress',
        'Kasarani Market main entrance',
        -1.2230, 36.8971
    );


-- ════════════════════════════════════════════════════════════
--  STATUS HISTORY — audit trail for the sample reports
-- ════════════════════════════════════════════════════════════
INSERT INTO report_status_history (report_id, changed_by, old_status, new_status, note) VALUES
    (1, 3,    NULL,          'open',          'Report submitted. Routed to: Pothole (KURA).'),
    (2, 4,    NULL,          'open',          'Report submitted. Routed to: Street Light Out (KPLC).'),
    (2, 2,    'open',        'in_progress',   'Report received and assigned to KPLC field team for assessment.'),
    (3, 5,    NULL,          'open',          'Report submitted. Routed to: Garbage Overflow (Public Health).'),
    (3, 2,    'open',        'in_progress',   'Collection truck scheduled for Friday 18 April 2026.');

-- ============================================================
--  ENHANCED SEED DATA — More reports for dashboard richness
-- ============================================================

INSERT INTO reports
  (id, tracking_number, title, description, category_id, ward_id, resident_id, assigned_to, status, latitude, longitude, upvote_count)
VALUES
  (4, 'CP-2026-00004','Burst water pipe flooding Westlands Road','Large burst pipe near Westlands roundabout. Water has been flowing for 2 days, flooding the road and nearby shops.',1,1,3,1,'in_progress',-1.2676,36.8033,14),
  (5, 'CP-2026-00005','Potholes on Ngong Road near Prestige Plaza','Multiple deep potholes causing accidents. A motorbike fell yesterday.',5,4,4,2,'submitted',-1.2921,36.7882,23),
  (6, 'CP-2026-00006','Illegal dumping behind Roysambu market','Residents are dumping garbage behind the market daily. Very bad smell.',13,14,5,4,'escalated',-1.2167,36.8667,31),
  (7, 'CP-2026-00007','Street lights out in Karen for 2 weeks','Entire stretch of Karen Road dark at night. Security threat.',9,8,3,3,'under_review',-1.3382,36.7127,18),
  (8, 'CP-2026-00008','Sewer overflow near Mathare North','Raw sewage overflowing onto footpath used by school children.',3,16,4,1,'in_progress',-1.2578,36.8583,27),
  (9, 'CP-2026-00009','Dangerous pothole swallowed a tyre — Kasarani','Pothole on Thika Road near Kasarani stadium is enormous.',5,13,5,2,'submitted',-1.2217,36.8983,9),
  (10, 'CP-2026-00010','Water supply cut for 5 days — Zimmerman','No water supply to the entire Zimmerman estate.',2,15,3,1,'escalated',-1.2050,36.8933,44),
  (11, 'CP-2026-00011','Garbage not collected — Kibera Olympic','Collection missed three weeks in a row. Overflowing.',12,7,4,4,'resolved',-1.3133,36.7872,12),
  (12, 'CP-2026-00012','Broken pavement injuring pedestrians — CBD','Smashed pavement slabs near Kencom bus stop.',6,17,5,2,'resolved',-1.2833,36.8333,7),
  (13, 'CP-2026-00013','Exposed live wires near Umoja school','Fallen electricity pole with exposed wires near St. Peters School.',11,11,3,3,'escalated',-1.2833,36.8833,38),
  (14, 'CP-2026-00014','Illegal construction blocking drainage — Kilimani','Unapproved wall built across drainage channel causing flooding.',17,4,4,6,'submitted',-1.2921,36.7882,5),
  (15, 'CP-2026-00015','Flooded road blocks access — Dandora Phase 2','Road completely impassable after rains for 3rd week.',7,12,5,2,'in_progress',-1.2500,36.9000,16);

-- More status history
INSERT INTO report_status_history (report_id, changed_by, old_status, new_status, note) VALUES
  (4,  2, 'submitted',    'under_review', 'Assigned to Nairobi Water field team.'),
  (4,  2, 'under_review', 'in_progress',  'Repair crew dispatched. Estimated 48hrs.'),
  (6,  2, 'submitted',    'under_review', 'Enforcement unit notified.'),
  (6,  2, 'under_review', 'escalated',    'Second complaint received. No action taken after 10 days.'),
  (8,  2, 'submitted',    'in_progress',  'Nairobi Water crew on site.'),
  (10, 2, 'submitted',    'escalated',    'No response after 7 days. Escalated to NMS.'),
  (11, 2, 'submitted',    'resolved',     'Collection done. Area cleaned. Closed.'),
  (12, 2, 'submitted',    'resolved',     'Pavement repaired by KURA crew. Closed.'),
  (13, 2, 'submitted',    'escalated',    'Urgent — near school. KPLC notified immediately.');

-- More upvotes
INSERT INTO upvotes (report_id, resident_id) VALUES
  (4,4),(4,5),(5,3),(5,5),(6,3),(6,4),(7,4),(7,5),
  (8,3),(8,5),(10,3),(10,4),(13,3),(13,4),(13,5);

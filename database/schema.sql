-- ============================================================
--  CivicPulse — PostgreSQL Schema
--  City Context : Nairobi County, Kenya
--  Author       : Sam | Strathmore University BBIT Year 3
--  Sprint       : 2 — Database Setup
--  Updated      : 16 Apr 2026 — aligned schema to match code
-- ============================================================

-- ─── Clean Slate (for re-runs during development) ───────────
DROP TABLE IF EXISTS report_status_history CASCADE;
DROP TABLE IF EXISTS upvotes            CASCADE;
DROP TABLE IF EXISTS reports            CASCADE;
DROP TABLE IF EXISTS categories         CASCADE;
DROP TABLE IF EXISTS authorities        CASCADE;
DROP TABLE IF EXISTS wards              CASCADE;
DROP TABLE IF EXISTS users              CASCADE;

-- ─── Drop old ENUM types if they exist ──────────────────────
DROP TYPE IF EXISTS user_role      CASCADE;
DROP TYPE IF EXISTS report_status  CASCADE;

-- ─── ENUM Types ──────────────────────────────────────────────
CREATE TYPE user_role      AS ENUM ('resident', 'authority_officer', 'admin');
CREATE TYPE report_status  AS ENUM ('open', 'in_progress', 'resolved', 'escalated', 'rejected');


-- ════════════════════════════════════════════════════════════
--  TABLE 1 — users
-- ════════════════════════════════════════════════════════════
CREATE TABLE users (
	id            SERIAL PRIMARY KEY,
	full_name     VARCHAR(120)        NOT NULL,
	email         VARCHAR(255) UNIQUE NOT NULL,
	password_hash TEXT                NOT NULL,
	role          user_role           NOT NULL DEFAULT 'resident',
	ward_id       INT,                          -- residents belong to a ward
	is_active     BOOLEAN             NOT NULL DEFAULT TRUE,
	created_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
	updated_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);


-- ════════════════════════════════════════════════════════════
--  TABLE 2 — wards  (Nairobi's wards, seeded separately)
-- ════════════════════════════════════════════════════════════
CREATE TABLE wards (
	id            SERIAL PRIMARY KEY,
	name          VARCHAR(100) UNIQUE NOT NULL,
	subcounty     VARCHAR(100)        NOT NULL,
	constituency  VARCHAR(100)        NOT NULL,
	latitude      DECIMAL(9,6),                 -- ward centroid
	longitude     DECIMAL(9,6),
	created_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- Add FK now that wards exists
ALTER TABLE users ADD CONSTRAINT fk_users_ward
	FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE SET NULL;


-- ════════════════════════════════════════════════════════════
--  TABLE 3 — authorities  (e.g. Nairobi Water, KURA, KPLC)
-- ════════════════════════════════════════════════════════════
CREATE TABLE authorities (
	id            SERIAL PRIMARY KEY,
	name          VARCHAR(150) UNIQUE NOT NULL,
	description   TEXT,
	contact_email VARCHAR(255),
	created_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);


-- ════════════════════════════════════════════════════════════
--  TABLE 4 — categories  (issue types mapped to an authority)
-- ════════════════════════════════════════════════════════════
CREATE TABLE categories (
	id                   SERIAL PRIMARY KEY,
	name                 VARCHAR(100) UNIQUE NOT NULL,
	description          TEXT,
	default_authority_id INT NOT NULL REFERENCES authorities(id) ON DELETE RESTRICT,
	created_at           TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);


-- ════════════════════════════════════════════════════════════
--  TABLE 5 — reports  (core table)
-- ════════════════════════════════════════════════════════════
CREATE TABLE reports (
	id               SERIAL PRIMARY KEY,
	tracking_number  VARCHAR(20) UNIQUE,                       -- auto-generated via trigger
	title            VARCHAR(255)       NOT NULL,
	description      TEXT               NOT NULL,
	category_id      INT  NOT NULL REFERENCES categories(id)   ON DELETE RESTRICT,
	ward_id          INT  NOT NULL REFERENCES wards(id)        ON DELETE RESTRICT,
	user_id          INT  NOT NULL REFERENCES users(id)        ON DELETE CASCADE,
	authority_id     INT  REFERENCES authorities(id)           ON DELETE SET NULL,
	status           report_status      NOT NULL DEFAULT 'open',
	address          TEXT,                                      -- street address or landmark
	latitude         DECIMAL(9,6),                              -- pin drop location
	longitude        DECIMAL(9,6),
	upvote_count     INT                NOT NULL DEFAULT 0,
	is_escalated     BOOLEAN            NOT NULL DEFAULT FALSE,
	escalated_at     TIMESTAMPTZ,
	resolved_at      TIMESTAMPTZ,
	created_at       TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
	updated_at       TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);


-- ════════════════════════════════════════════════════════════
--  TABLE 6 — upvotes  (one per user per report)
-- ════════════════════════════════════════════════════════════
CREATE TABLE upvotes (
	id          SERIAL PRIMARY KEY,
	report_id   INT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
	user_id     INT NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
	created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	UNIQUE (report_id, user_id)        -- prevents duplicate upvotes
);


-- ════════════════════════════════════════════════════════════
--  TABLE 7 — report_status_history  (full audit trail)
-- ════════════════════════════════════════════════════════════
CREATE TABLE report_status_history (
	id          SERIAL PRIMARY KEY,
	report_id   INT           NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
	changed_by  INT           REFERENCES users(id) ON DELETE SET NULL,  -- NULL = system action
	old_status  report_status,
	new_status  report_status NOT NULL,
	note        TEXT,                      -- officer resolution notes
	changed_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);


-- ════════════════════════════════════════════════════════════
--  INDEXES — for query performance
-- ════════════════════════════════════════════════════════════
CREATE INDEX idx_reports_ward       ON reports(ward_id);
CREATE INDEX idx_reports_status     ON reports(status);
CREATE INDEX idx_reports_user       ON reports(user_id);
CREATE INDEX idx_reports_category   ON reports(category_id);
CREATE INDEX idx_reports_authority  ON reports(authority_id);
CREATE INDEX idx_reports_created    ON reports(created_at DESC);
CREATE INDEX idx_upvotes_report     ON upvotes(report_id);
CREATE INDEX idx_history_report     ON report_status_history(report_id);


-- ════════════════════════════════════════════════════════════
--  FUNCTION — auto-update updated_at on row change
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_users
	BEFORE UPDATE ON users
	FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_reports
	BEFORE UPDATE ON reports
	FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ════════════════════════════════════════════════════════════
--  SEQUENCE + TRIGGER — auto-generate tracking numbers
-- ════════════════════════════════════════════════════════════
CREATE SEQUENCE IF NOT EXISTS report_tracking_seq START 10001;

CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS TRIGGER AS $$
BEGIN
	NEW.tracking_number := 'CP-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(nextval('report_tracking_seq')::TEXT, 5, '0');
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_tracking_number
	BEFORE INSERT ON reports
	FOR EACH ROW
	EXECUTE FUNCTION generate_tracking_number();

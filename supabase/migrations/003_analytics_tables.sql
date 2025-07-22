-- Analytics Tables

-- Visibility scores
CREATE TABLE visibility_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES platforms(id),
  topic_id UUID REFERENCES topics(id),
  score DECIMAL(5, 2) CHECK (score >= 0 AND score <= 100),
  rank INTEGER,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Citations
CREATE TABLE citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_result_id UUID REFERENCES execution_results(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  domain VARCHAR(255) NOT NULL,
  page_title TEXT,
  citation_type VARCHAR(50) CHECK (citation_type IN ('owned', 'earned', 'competitor', 'social')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bot visits
CREATE TABLE bot_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES platforms(id),
  url TEXT NOT NULL,
  user_agent TEXT,
  ip_address INET,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  response_status INTEGER
);
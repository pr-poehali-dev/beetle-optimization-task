CREATE TABLE IF NOT EXISTS player_positions (
  id SERIAL PRIMARY KEY,
  player_id VARCHAR(255) NOT NULL,
  x FLOAT NOT NULL,
  y FLOAT NOT NULL,
  z FLOAT NOT NULL,
  yaw FLOAT NOT NULL,
  pitch FLOAT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_player_positions_player_id ON player_positions(player_id);
CREATE INDEX IF NOT EXISTS idx_player_positions_updated_at ON player_positions(updated_at);
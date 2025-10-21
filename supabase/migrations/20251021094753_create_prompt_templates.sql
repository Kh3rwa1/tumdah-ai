/*
  # Create Prompt Templates System

  1. New Tables
    - `prompt_templates`
      - `id` (uuid, primary key) - Unique identifier
      - `name` (text, unique) - Template name/identifier
      - `category` (text) - Category: 'story_expansion' or 'image_style'
      - `label` (text) - Display label for UI
      - `prompt` (text) - The actual prompt template
      - `is_active` (boolean) - Whether template is active
      - `is_default` (boolean) - Whether this is the default template for category
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on prompt_templates table
    - Allow public read access for active templates
    - Restrict write/update/delete to authenticated users only

  3. Initial Data
    - Insert default story expansion prompts
    - Insert default image style prompts (Cinematic, Anime, Oil Painting, Sketch, etc.)
*/

CREATE TABLE IF NOT EXISTS prompt_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text NOT NULL CHECK (category IN ('story_expansion', 'image_style')),
  label text NOT NULL,
  prompt text NOT NULL,
  is_active boolean DEFAULT true,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active prompt templates"
  ON prompt_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert prompt templates"
  ON prompt_templates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update prompt templates"
  ON prompt_templates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete prompt templates"
  ON prompt_templates FOR DELETE
  TO authenticated
  USING (true);

INSERT INTO prompt_templates (name, category, label, prompt, is_default) VALUES
  (
    'story_expansion_default',
    'story_expansion',
    'Default Story Expansion',
    'You are a story architect and master narrator. Expand this idea into a complete, engaging, and cinematic story. Follow professional storytelling rules: create a protagonist with clear goals, build the plot around cause-and-effect, escalate stakes, introduce conflict, and tie it all to a universal theme. The story should be delivered in narrative prose (not an outline), feel emotionally resonant, and be approximately 800-1500 words. Stay true to the original concept while enriching it with vivid details, compelling characters, and dramatic tension.',
    true
  ),
  (
    'story_enhancement_default',
    'story_expansion',
    'Story Enhancement',
    'You are a story architect and master narrator. Rewrite and enhance this story. Improve the pacing, add more vivid details and sensory descriptions, deepen character development, heighten dramatic tension, and ensure a compelling narrative arc. Keep the core concept and plot but elevate the prose to professional, cinematic quality. Output approximately 1000-1500 words.',
    false
  ),
  (
    'style_cinematic',
    'image_style',
    'Cinematic',
    'Create a photorealistic, cinematic image with dramatic lighting, depth of field, and professional color grading. Style should resemble a high-budget film production with rich atmosphere and emotional impact.',
    true
  ),
  (
    'style_anime',
    'image_style',
    'Anime',
    'Create an anime-style illustration with bold line work, vibrant colors, expressive character designs, and dynamic composition. Style should resemble high-quality Japanese animation with attention to detail and emotional expression.',
    false
  ),
  (
    'style_oil_painting',
    'image_style',
    'Oil Painting',
    'Create an image in the style of classical oil painting with visible brushstrokes, rich texture, warm color palette, and masterful use of light and shadow. Style should resemble Renaissance or Impressionist artwork.',
    false
  ),
  (
    'style_sketch',
    'image_style',
    'Sketch',
    'Create a pencil sketch or charcoal drawing with loose, expressive linework, careful attention to shading and form, and artistic imperfection. Style should resemble an artist''s conceptual sketch with energy and spontaneity.',
    false
  ),
  (
    'style_watercolor',
    'image_style',
    'Watercolor',
    'Create a watercolor painting with soft edges, translucent colors, paper texture visible, and fluid, organic color blending. Style should resemble traditional watercolor art with delicate washes and gentle color transitions.',
    false
  ),
  (
    'style_comic',
    'image_style',
    'Comic Book',
    'Create a comic book style image with bold outlines, flat colors, halftone shading, and dynamic panel composition. Style should resemble American comic books with strong visual impact and graphic storytelling.',
    false
  ),
  (
    'style_3d_render',
    'image_style',
    '3D Render',
    'Create a 3D rendered image with smooth surfaces, realistic materials, accurate lighting, and professional rendering quality. Style should resemble high-end CGI with attention to texture, reflection, and depth.',
    false
  )
ON CONFLICT (name) DO NOTHING;

CREATE TRIGGER prompt_templates_updated_at
  BEFORE UPDATE ON prompt_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE INDEX IF NOT EXISTS idx_prompt_templates_category ON prompt_templates(category);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_active ON prompt_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_default ON prompt_templates(is_default);
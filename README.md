# Mood Mapper: A Sentimental Journey through Places
MoodMapper is an interactive web-based travel journal that blends emotion, memory, and geography. Users upload travel photos and reflections, which are then analyzed through AI-powered sentiment tools to generate unique emotional fragments. These are visualized on an interactive map, helping users trace and relive the emotional arc of their journeys.
# Target Users 
- Solo travelers seeking emotional connection or self-reflection
- People dealing with long-distance separation or grief
- Mental wellness seekers who use journaling for mood tracking
- Creatives and storytellers exploring emotion-mapped narratives
# Key deliverables
- A responsive web platform that allows users to upload photos, write reflections, and tag locations.
- Integration of an NLP API (e.g., OpenAI or Google Cloud NLP) to analyze users’ emotional tone from text input.
- Custom module that transforms emotional data into short poetic or abstract “mood fragments” based on sentiment scores.
- Integration of Mapbox or Google Maps API to display emotion-tagged memories on a global map.
- A visual timeline of trips with mood filters, searchable memory logs, and personal analytics (e.g., most joyful places).
- Cloud storage setup (Firebase, AWS, or Supabase) for securely storing user media and mood data.

# Special constraints
- Data Privacy & Compliance
  Handle user-uploaded content (photos, reflections) with sensitivity and comply with GDPR-like policies:
  - No sharing or analyzing data without consent
  - Option to delete all personal data
  - Clear privacy policy on how data is used
- Third-Party API Restrictions
  - Need to securely manage API keys for OpenAI, NLP services, and mapping platforms.
  - Respect usage limits and terms of service of third-party platforms.
- Media Storage Limitations
  - Efficiently handle large image uploads and reduce cost with compression or CDN-based delivery.
  - Plan for storage scalability and backup/recovery options.
- Accessibility & Inclusivity
  - Ensure UI/UX is accessible to users with different abilities (WCAG standards).
  - Emotionally sensitive design language to avoid triggering content.

# Expected outcome
- A working web platform that helps users revisit travel memories through emotions, not just locations.
- A creative proof-of-concept using AI and maps for emotional storytelling.
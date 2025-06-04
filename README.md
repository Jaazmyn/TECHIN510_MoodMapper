# Mood Mapper: A Sentimental Journey through Places
MoodMapper is an interactive web-based travel journal that blends emotion, memory, and geography. Users upload travel photos and reflections, which are then analyzed through AI-powered sentiment tools to generate unique emotional fragments. These are visualized on an interactive map, helping users trace and relive the emotional arc of their journeys.

# Target Users 
- Solo travelers seeking emotional connection or self-reflection
- People dealing with long-distance separation or grief
- Mental wellness seekers who use journaling for mood tracking
- Creatives and storytellers exploring emotion-mapped narratives

# Key deliverables (from Client 4/4)
- A responsive web platform that allows users to upload photos, write reflections, and tag locations.
- Integration of an NLP API (e.g., OpenAI or Google Cloud NLP) to analyze users’ emotional tone from text input.
- Custom module that transforms emotional data into short poetic or abstract “mood fragments” based on sentiment scores.
- Integration of Mapbox or Google Maps API to display emotion-tagged memories on a global map.
- A visual timeline of trips with mood filters, searchable memory logs, and personal analytics (e.g., most joyful places).
- Cloud storage setup (Firebase, AWS, or Supabase) for securely storing user media and mood data.

# Features (updated by Developer 4/11)
- Homepage – Galaxy View: A dynamic galaxy interface with floating planets, where each planet represents a unique journey.
- Create Journey (New Planet): Users can create a new journey by entering a title and description, and uploading photos and text. A new planet is formed in the galaxy.
- View Journey: Users can click on a planet to explore the journey details.
- Share Journey Highlights: Generate a shareable overview summarizing journeys to share with friends.
- (Nice to Have) Chatbot Companion: A friendly chatbot at the bottom of the screen that encourages users to reflect and add more details to their journeys.

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

# Timeline

| Phase       | Milestone                                           | Due Date |
|-------------|-----------------------------------------------------|----------|
| Planning    | Complete requirements document                      | 4/7      |
| Design      | Complete system design                              | 4/18     |
|             | Complete interface design                           | 5/2      |
| Development | Complete journey input (upload photos, input text)  | 4/25     |
|             | Complete AI integration (generate mood fragments)   | 5/9      |
|             | Complete visualization (galaxy view, share view)    | 5/16     |
| Testing     | Test and fix                                        | 5/27     |
| Launch      | Go live!                                            | 5/30     |

# Weekly Progress
- 4/18: Set up the initial React project environment. Build the homepage layout and entry modal.
- 4/25: Build journey creation flow.
- 5/16: Build journey summary flow.

# How to Run
### Prerequisites
- Download and install Node.js from https://nodejs.org
### Clone and Set up Environment
1. Clone the repository
``` bash
git clone https://github.com/Jaazmyn/TECHIN510_MoodMapper.git
cd TECHIN510_MoodMapper/mood_mapper
```
2. Install dependencies
``` bash
npm install
```
3. Start the development server
``` bash
npm start
```



# Contact Information

Client
- Name: Jazmyn Zhang
- Email: minjia27@uw.edu
- Github: @Jaazmyn

Developer
- Name: Hazel Chen
- Email: hazelycc@uw.edu
- Github: @corylus98

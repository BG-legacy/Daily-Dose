# Daily Dose

## Overview
**Daily Dose** is a web app designed to inspire and support users in their daily lives by curating inspirational quotes, mental health tips, and productivity hacks. It enables users to:
- Journal their thoughts.
- Track their mood over time.
- Receive AI-driven recommendations tailored to their journal entries and mood.
- Save, share, and revisit past content.

## Features
1. **Daily Dose Feed**
   - Refreshing daily content with inspirational quotes, mental health tips, and productivity hacks.

2. **Journaling**
   - Write and save daily journal entries.
   - AI analyzes tone and generates personalized recommendations.
   - View past entries in the Journal History section.

3. **Mood Tracking Dashboard**
   - Input mood daily using sliders or emojis.
   - Visualize mood history with a graph and track journaling streaks.
   - Gamified elements to encourage consistency.

4. **Personalized Notifications**
   - Receive Daily Dose content via automated email notifications.

5. **Save & Share**
   - Save favorite quotes or tips.
   - Share content on social media platforms.

## Tech Stack
| Component                | Technology           |
|--------------------------|----------------------|
| Frontend Framework       | Next.js, Tailwind CSS |
| Backend/API              | Node.js, Next.js API Routes |
| AI Integration           | OpenAI GPT API      |
| Database                 | AWS DynamoDB (NoSQL) |
| Notifications            | AWS SES, Firebase Messaging |
| Hosting                  | AWS Amplify / Vercel |
| Data Visualization       | Chart.js            |
| User Authentication      | NextAuth.js (or Firebase Auth) |
| Collaboration Tools      | GitHub, Figma, Trello |

## How to Use
1. **Daily Inspiration**: Log in to view curated content refreshed daily.
2. **Journaling**: Save your thoughts and let the AI generate personalized recommendations.
3. **Track Your Mood**: Input your daily mood and monitor trends with visual graphs.
4. **Save & Share**: Bookmark your favorite content and share it on social media.
5. **Notifications**: Opt-in for daily emails delivering your Daily Dose.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/daily-dose.git
   ```
2. Navigate to the project directory:
   ```bash
   cd daily-dose
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Configure environment variables:
   - Set up your AWS and OpenAI API keys in a `.env` file.
5. Start the development server:
   ```bash
   npm run dev
   ```

## Lessons Learned
- Creating empathetic and user-centric applications.
- Integrating AI to provide tailored content.
- Balancing frontend and backend responsibilities in a collaborative team.

## Challenges
- Designing accurate AI-driven recommendations.
- Managing seamless integration of features within the timeline.
- Maintaining sensitivity to mental health needs.

## Future Enhancements
- **Voice-to-Text Journaling**: Use Web Speech API for dictating journal entries.
- **AI Insights**: Provide summarized insights based on journal history.
- **Push Notifications**: Add mobile/browser notifications for reminders and updates.

## Contributing
We welcome contributions! Please fork the repository and submit a pull request with your changes.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contact
For questions or feedback, feel free to reach out at [your.email@example.com].

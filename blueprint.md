
# **App Name**: AyurAid

## Core Features:

### 1. AI Chatbot (`/chatbot`)
-   **AI-Powered Guidance**: Offers personalized Ayurvedic and alternative medicine advice based on user questions.
-   **Intuitive Chat Interface**:
    -   Displays user and AI messages in a clear, conversational format.
    -   Shows loading indicators during AI processing.
    -   Provides general Ayurvedic information and wellness tips.

### 2. Health Analytics Dashboard (`/dashboard`)
-   **Medication Adherence Calendar**:
    -   Visualizes daily medication adherence using a color-coded calendar.
    -   Includes a legend explaining color mappings for adherence percentages.
    -   Tooltip on hover for specific adherence details.
-   **Key Biomarkers Overview**:
    -   Scrollable list of ~40 important biomarker cards.
    -   Each card displays biomarker name, icon, current value, target value, optimal range, and status (optimal, warning, critical).
-   **Diet Analytics**:
    -   Vertical stacked bar graph showing daily macronutrient and micronutrient intake over the last 30 days.
-   **Workout Performance**:
    -   **Workout Overview**: Radial chart displaying scores for 5 fitness metrics (e.g., Strength, Flexibility, VO2 Max, Endurance, Agility).
    -   **Cardio Performance**: Line chart illustrating trends in cardio workouts (duration, distance) over the last 30 days.
-   **Mindfulness & Wellness**:
    -   **Yoga Practice Breakdown**: Sunburst chart detailing distribution of yoga types and focus areas.
    -   **Meditation Practices**: Donut chart showing time spent in different meditation types.
-   **Sleep & Mental Wellness**:
    -   Combined chart: Stacked bar graph for sleep stages (REM, Deep, Light, Awake) overlaid with line graphs for mental health metrics (e.g., Stress Level, Mood Score) over 30 days.

### 3. Practitioners Page (`/practitioners`)
-   **Browse Practitioners**: Displays a list of available Ayurvedic practitioners.
-   **Practitioner Cards**: Each card shows:
    -   Image (from `randomuser.me` API).
    -   Name, specialization, and brief bio.
    -   Star rating, location, and availability.
-   **Interactive Modals**:
    -   **Practitioner Info Modal**: Provides detailed information about a selected practitioner.
    -   **Book Appointment Modal**: Allows users to select a date, time slot, and booking mode (online/in-person) to schedule an appointment.

### 4. Ayurvedic Shop (`/shop`)
-   **Product Showcase**: Grid display of Ayurvedic products available for purchase.
-   **Product Cards**: Each card features:
    -   Product image (placeholder `picsum.photos`).
    -   Name, category, description, and price.
    -   Stock availability.
-   **Add to Cart**: Button to add products to the shopping cart.

### 5. Shopping Cart & Checkout
-   **Cart Modal**: Accessible via a header icon, displays:
    -   List of items in the cart with images, names, prices, and quantities.
    -   Ability to update item quantity or remove items.
    -   Total number of items and total price.
-   **Simulated Checkout**: Allows users to "place an order" (no actual payment processing), which then clears the cart and shows a success message.
-   **Persistent Cart**: Cart state is saved in `localStorage`.

### 6. Treatment Plan Page (`/treatment-plan`)
-   **Personalized Overview**:
    -   **Problem Overview Card**: Displays the main health issue, a summary of the treatment plan, and key goals.
    -   **Milestones Tracker**: Shows progress towards treatment milestones with due dates and status (completed, in-progress, pending).
-   **Biomarker Monitoring**:
    -   **Concerning Biomarkers Card**: Highlights specific biomarkers relevant to the treatment plan, showing current vs. target values.
-   **Practitioner & Consultations**:
    -   **Assigned Practitioner Card**: Displays information about the practitioner assigned to the plan.
    -   **Upcoming Consultations List**: Lists scheduled future appointments with details.

### 7. Daily Schedule Page (`/schedule`)
-   **Chronological Activity View**: Displays a list of daily wellness activities (e.g., morning routine, meals, yoga, medication) as cards, sorted by time.
-   **Activity Detail Modal**: Clicking on an activity card opens a modal with detailed instructions and information for that specific task.
-   **Dynamic Icons**: Uses relevant icons for different activity types.

### 8. General Application Features
-   **Navigation**: Consistent header with links to all main pages (Chatbot, Dashboard, Treatment Plan, Schedule, Practitioners, Shop).
-   **Styling**:
    -   Utilizes ShadCN UI components and Tailwind CSS for a modern, professional look.
    -   Adheres to a nature-inspired color palette (Natural Green, Light Beige, Earthy Brown).
-   **Responsiveness**: Designed to work across various screen sizes.
-   **Icons**: Uses `lucide-react` for clear, nature-inspired icons.
-   **Toast Notifications**: Provides user feedback for actions like adding to cart, booking appointments, and placing orders.

## Style Guidelines:

-   **Primary Color**: Natural green (`#4CAF50` / HSL: `120 39% 49%`) - Represents health, nature, and vitality. Used for primary actions, active states, and key highlights.
-   **Secondary Color**: Light beige (`#F5F5DC` / HSL: `60 56% 91%`) - Provides a calming, organic, and clean background feel.
-   **Accent Color**: Earthy brown (`#A0522D` / HSL: `25 57% 41%`) - Used for accents, secondary actions, and to complement the natural theme.
-   **Fonts**: Clear, readable sans-serif fonts (Geist Sans) optimized for displaying health-related information. Monospace font (Geist Mono) for specific UI elements if needed.
-   **Icons**: Simple, intuitive, and nature-inspired icons from the `lucide-react` library.
-   **Layout**: Clean, organized, and spacious layout to ensure readability and ease of use. Use of cards for grouping information.
-   **Component Styling**: Rounded corners, subtle shadows, and drop shadows on elements like cards and modals to give them a professional and modern feel.
-   **Animations**: Subtle and purposeful animations for chatbot responses, modal transitions, and interactive elements to enhance user experience without being distracting.
-   **Branding**: App name "AyurAid" with a leaf icon to reinforce the natural and Ayurvedic theme.

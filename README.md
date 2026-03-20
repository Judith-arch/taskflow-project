## bootcamp-project

Readme change made in feature/setup branch:
Updated list task for marge to main.

# Design (doing)
- **General Strucutre**
Task manager web, with 3 layouts: sidebar, main view (tasks page) and task panel.

- **Sidebar**
Navigtion between lists/projects + user profile.

- **"Tasks page"**
Project name header.


- **Flow**






# The Exercise
Build a task management app called TaskFlow that allows users to create, complete, delete, and filter tasks. The app must store data in LocalStorage, display basic statistics, and work properly on both mobile and desktop. Set up the project with Git and GitHub, build the interface using HTML and CSS, implement the logic with JavaScript, enhance the design with Tailwind, and deploy the app to Vercel by following the steps provided.

# Step by Step
1. **Set up the development environment**
- [X] ~~Install VS Code and Git on your computer~~
- [X] ~~Configure Git with your user.name and user.email~~
- [X] ~~Create a GitHub account if you don’t already have one~~
- [X] ~~Create a private repository named bootcamp-project~~
- [X] ~~Clone the repository to your local machine~~
- [X] ~~Create a README.md file with a brief description of the project~~
- [X] ~~Make your first commit and push it to GitHub~~
- [X] ~~Add @corner-estudios and @elbaronjack as collaborator~~
- [X] ~~Install useful extensions in VS Code (Prettier, ESLint, Live Server)~~
- [X] ~~Create a .gitignore file for Node, the operating system, and the editor~~
- [X] ~~Practice the Git workflow by creating a feature/setup branch, making a change, and merging it into main~~

2. **Plan the application**
- [X] ~~Design the TaskFlow interface before coding~~
    - Concept developed in a doc on drive~~
- [X] ~~Create a simple wireframe on paper or using a tool like Figma or Excalidraw~~
- [X] ~~Define the main sections of the application: header, task list, form, and statistics panel~~
- [X] ~~Define the actions the user will be able to perform: add tasks, mark tasks as completed, delete tasks, and view statistics~~
- [X] ~~Save a screenshot or image of the design in the docs/design folder within the repository~~
- [X] ~~Write a brief explanation of the app’s design in the README~~

3. **Create the HTML structure**
- [X] ~~Create the index.html file~~
- [X] ~~Define the structure using semantic HTML (header, main, aside, footer)~~
- [X] ~~Add a main title for the app~~
- [X] ~~Create a form to add new tasks~~
- [X] ~~Add a list to display the tasks~~
- [X] ~~Create a sidebar to display statistics (total, completed, and pending)~~
- [X] ~~Define a template or base structure for each task~~
- [X] ~~Ensure the form has correctly associated label tags~~
- [X] ~~Verify that there is only one h1 and that the headings follow a logical order~~
- [X] ~~Validate the HTML using the W3C validator~~

4. **Design the layout with CSS**
- [X] ~~Create the style.css file
- [X] ~~Define CSS variables in :root for colors, typography, and spacing
- [X] ~~Apply a basic CSS reset
- [X] ~~Design the application header
- [X] ~~Create the main layout using Flexbox
- [X] ~~Define a sidebar with a fixed width for statistics
- [X] ~~Design the task cards with borders, padding, and shadows
- [X] ~~Ensure the typography is legible (minimum 16px for inputs)
- [X] ~~Add hover and focus states to buttons and inputs

5. **Make the app responsive**
- [ ] Add media queries for small screens
- [ ] Ensure the layout adapts correctly on mobile
- [ ] Move the statistics panel below the main content on small screens
- [ ] Make the form adapt well to narrow screens
- [ ] Test the app on different screen sizes using the browser’s developer tools

6. **Implement the logic with JavaScript**
- [ ] Create the app.js file
- [ ] Define the structure of a task as an object with id, title, completed, and createdAt
- [ ] Implement the functionality to add new tasks
- [ ] Render the tasks in the DOM
- [ ] Allow tasks to be marked as completed
- [ ] Allow tasks to be deleted
- [ ] Update statistics when tasks change
- [ ] Avoid code duplication by creating reusable functions

7. **Persist data using LocalStorage**
- [ ] Save tasks to LocalStorage using JSON.stringify
- [ ] Retrieve tasks when the page loads using JSON.parse
- [ ] Handle the case where no data is saved correctly
- [ ] Ensure that changes to tasks are saved automatically
- [ ] Verify that the data is still there when the page is reloaded

8. **Add extra features**
- [ ] Implement a filter to view tasks: all, pending, and completed
- [ ] Add a text search for tasks
- [ ] Allow editing the title of an existing task
- [ ] Add a button to mark all tasks as completed
- [ ] Add a button to delete all completed tasks

9. **Migrate styles to Tailwind**
- [ ] Install Tailwind CSS via CDN
- [ ] Gradually replace custom CSS with Tailwind classes
- [ ] Implement dark mode using dark classes:
- [ ] Add a button to toggle dark mode on and off
- [ ] Save the user’s preference in LocalStorage

10. **Manual testing of the application**
- [ ] Test the app with an empty list
- [ ] Try adding a task without a title
- [ ] Add a task with a very long title
- [ ] Mark several tasks as completed
- [ ] Delete several tasks
- [ ] Reload the page to verify that the data persists
- [ ] Document the test results in the README

11. **Basic Accessibility**
- [ ] Verify that the entire application can be used with a keyboard
- [ ] Ensure that buttons have text or an `aria-label` attribute
- [ ] Check color contrast
- [ ] Verify that the focus is visible when navigating with the Tab key

12. **Deploy the application**
- [ ] Connect the GitHub repository to Vercel
- [ ] Import the project from Vercel
- [ ] Check that the application works correctly in production
- [ ] Make a change to the project and upload it to GitHub
- [ ] Check that Vercel automatically redeploys
- [ ] Add the application’s public URL to the README
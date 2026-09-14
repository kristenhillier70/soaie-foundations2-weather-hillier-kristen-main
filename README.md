# WeatherWise

This is a simple app created as training material for SDD feature integrations.

WeatherWise displays a 7-day weather forecast for Seattle. It's a static
front-end app (HTML, CSS, and vanilla JavaScript) that fetches live data from
the free [Open-Meteo API](https://open-meteo.com/) (no API key required) and
falls back to sample data if the network request fails.

## Running the application

Before using Superpowers to add functionality, run the app using the instructions below to see the baseline on top of which you'll be building. 

### Option 1: Python (no install needed on macOS/Linux)

From the the root folder of your forked repository, start a local server:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

### Option 2: Node.js

From the project folder:

```bash
npx serve
```

(or `npx http-server`), then open the URL shown in the terminal.

### Option 3: VS Code Live Server

Install the **Live Server** extension, then right-click `index.html` and choose
**Open with Live Server**.

## Stopping the server

Press `Ctrl+C` in the terminal running the server.

## Project structure

- `index.html` — page markup and layout.
- `styles.css` — styling for the app.
- `app.js` — fetches the forecast and renders the day cards.

---

## Lab: Add a feature with Superpowers (Spec-Driven Development)

In this lab you'll play the role of a Solution Owner. You will **not** write any
code yourself. Instead, you'll work with an AI assistant that has a tool called
[Superpowers](https://github.com/obra/superpowers). You describe the feature you
want in plain English, the assistant asks you questions and writes up a plan (a
"spec"), and then it builds the feature for you. Your job is to make decisions
and give feedback — just like leading a software team.

Don't worry if some of the steps below look technical. You'll mostly be copying
and pasting a few commands and then having a conversation with GitHub Copilot,
the AI assistant built into VS Code.

> **A few terms you'll see:**
> - **Terminal** — a text window where you type commands. In VS Code, open one
>   with the menu **Terminal → New Terminal**. Whatever you type there runs
>   inside your project folder automatically.
> - **Command** — a line of text you paste into the Terminal and press Enter to
>   run.
> - **Copilot Chat** — GitHub Copilot's chat panel inside VS Code, where you'll
>   have your conversation with the assistant.

### Before you start

1. Make sure you have this WeatherWise project open in VS Code.
2. Make sure you're signed in to GitHub Copilot in VS Code. If you see the
   Copilot icon in the Activity Bar on the left edge of the window, you're set.
   (If not, ask your instructor for help getting Copilot enabled.)
3. Open a Terminal: from the top menu, choose **Terminal → New Terminal**. A
   panel will appear at the bottom of the window. This is where you'll paste the
   commands in the steps below. You do not need to change any folders — the
   Terminal already starts inside the project.

### Step 1 — Give Copilot its "Superpowers"

Superpowers is an add-on that teaches GitHub Copilot a proven, step-by-step way
to build software. You'll add it in two parts: first download it into the
project, then turn it on in Copilot.

1. Take a quick look at what Superpowers is here:
   <https://github.com/obra/superpowers> (no need to read it all — just skim).

2. **Download Superpowers into the project.** Copy the two lines below, paste
   them into the Terminal, and press Enter. This downloads a copy of Superpowers
   into the project so Copilot can use it as reference material.

   ```bash
   git submodule add https://github.com/obra/superpowers.git superpowers
   git submodule update --init --recursive
   ```

   > **What just happened?** You added a copy of the Superpowers project inside
   > this one. You'll now see a new `superpowers` folder in the file list on the
   > left. You don't need to open or edit anything in it.

3. **Turn Superpowers on in Copilot.** This part differs by platform, so follow
   the commands for your operating system.

   **On macOS / Linux**, paste these two lines one at a time (press Enter after
   each). If either reports an error, stop and ask your instructor rather than
   continuing:

   ```bash
   copilot plugin marketplace add obra/superpowers-marketplace
   copilot plugin install superpowers@superpowers-marketplace
   ```

   **On Windows**, the install command can fail with
   `Access is denied (os error 5)` — the CLI's extractor trips on a Git symlink
   in the Superpowers repo. Add the marketplace, then copy the skills in with
   PowerShell instead. Paste each line one at a time (press Enter after each):

   ```powershell
   copilot plugin marketplace add obra/superpowers-marketplace
   New-Item -ItemType Directory -Path "$env:USERPROFILE\.agents\skills" -Force; Copy-Item -Path "superpowers\skills\*" -Destination "$env:USERPROFILE\.agents\skills\" -Recurse -Force
   ```

   > **What just happened?** Copilot now knows the Superpowers method and will
   > use it automatically when you ask it to build something. If either command
   > reports an error, ask your instructor for help before continuing.

### Step 2 — Decide on a feature by brainstorming with Copilot

Now you'll have a conversation with Copilot to figure out what to build.

1. Open **Copilot Chat**: click the Copilot icon in the Activity Bar on the left
   edge of VS Code, or use the menu **View → Chat**. A chat panel opens where you
   can type messages.
2. In the chat box, type a forward slash (`/`) to bring up the list of available
   commands, then choose the **brainstorming** skill. You can also type it and
   press Enter. The command differs by how you installed Superpowers:

   **On macOS / Linux** (plugin install):

   ```text
   /superpowers brainstorming
   ```

   **On Windows** (PowerShell copy):

   ```text
   /brainstorming
   ```

   > Either one starts the Superpowers brainstorming skill, which is designed to
   > walk you through turning an idea into a clear plan. (Superpowers may also
   > start this step on its own once you describe a feature — either way is
   > fine.)

3. Copilot will start asking you questions. Answer them in plain language — focus
   on *what* you want and *why*, not on *how* to build it. There are no wrong
   answers; this is a conversation to shape your idea.

   Not sure what to build? Here are some ideas:
   - Let people look up a different city instead of only seeing Seattle.
   - Add a button to switch between Fahrenheit and Celsius.
   - Show extra details like wind speed, humidity, or "feels like" temperature.
   - Highlight the nicest weather day of the week.

4. **Ask for a written spec.** Because these features are small, Superpowers
   might otherwise just describe the design in the chat and start coding. For
   this lab we want a spec you can point to, so paste this into the chat:

   > Please treat this as a full design: write out a spec document and save it
   > before implementing, even though the feature is small.

   By asking for a spec on this small feature you are more closely mirroring the behavior you would see an SDD tool take on a larger enterprise feature.

5. Keep answering Copilot's questions until it writes a **spec file** — a clear,
   saved description of the feature. Copilot will save it under
   `docs/superpowers/specs/` (look for a new file whose name ends in
   `-design.md` in the file list on the left). Open it and read it over. If
   something's off, tell Copilot what to change. When it looks right, tell
   Copilot you approve it (for example: "This looks good, let's go with it.").

### Step 3 — Let Copilot build the feature

1. Once you've approved the spec, ask Copilot to build it. Type this in the chat
   and send it:

   > Looks good. Please implement this feature.

2. Copilot will make a plan and start building. It may show you its progress or
   ask a few more questions along the way — just answer them in the chat as they
   come up. This part can take a little while; let it work. If Copilot asks for
   permission to make changes or run commands, say yes to let it continue.

### Step 4 — Run the app and see your new feature

When Copilot says it's finished, start (or refresh) the app and look at your feature.

1. Use the method you used in 'Running the application' above to start your app again if needed (otherwise simply refresh).
3. Check that your new feature works the way your spec described. When you're
   done looking, go back to the Terminal and press `Ctrl+C` to stop the app.

   > If it doesn't look right, go back to Copilot Chat and tell Copilot what's
   > wrong — for example, "The city search box isn't showing up." It will help
   > you fix it.

### Step 5 — Save and submit your work

Superpowers will have created Git commits as it was working through the spec-and-implement lifecycle. To submit your lab work for this module, follow the steps below.

1. Ensure that all new files and changes have been committed or merged to your repo's main branch (use AI as your assistant here if needed).

2. Push the branch back to origin (Slalom Github). Again, you can use AI as your assistant; alternatively, you can run the terminal command below.

```bash
git push origin main
```

That push constitutes your final submission for this lab. When your soaie-foundations2-weather<-lastName-firstName> forked repository is up-to date with latest changes in Slalom's Github, you're done!
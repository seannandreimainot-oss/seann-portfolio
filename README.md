# Seann Andrei Mainot — Portfolio

A responsive static portfolio for an AI Video Specialist, with light/dark mode, video categories, a YouTube video player, creative process, tools, and contact links.

## Upload to GitHub

1. Extract the ZIP on your computer.
2. Create a public GitHub repository, or open your existing repository.
3. Choose **Add file → Upload files**. For an empty repository, use **uploading an existing file**.
4. Drag the extracted files and the `assets` folder into the upload area. Upload the contents, not the ZIP or its enclosing folder.
5. Commit the upload to your main branch.

Keep this structure at the repository root:

```text
index.html
styles.css
script.js
.nojekyll
README.md
assets/
  seann-camera-portrait.jpg
  tools-stack.png
  google-flow-logo.png
```

## Publish with GitHub Pages

Open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select your main branch and **/(root)**, then **Save**. The Pages settings will show your website link after deployment completes.

Official instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

No installation or build command is required. All website asset paths are relative, so the portfolio also works under a repository URL path.

## Edit the portfolio

- `index.html`: name, introductory text, portrait reference, and contact details.
- `script.js`: YouTube videos in `projectEntries`, categories, process content, and tools.
- `styles.css`: colors, layout, responsive sizing, and animation.
- `assets/`: portrait and tool images.

Videos are embedded from YouTube; no video files need to be uploaded. YouTube players and thumbnails, and Google Fonts, require an internet connection.

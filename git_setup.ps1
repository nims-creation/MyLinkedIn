git init
git add package.json package-lock.json next.config.mjs eslint.config.mjs jsconfig.json postcss.config.mjs SETUP.md FIREBASE_SETUP.md .gitignore start-dev.bat
git commit -m "chore: initial project configuration and setup"
git add server/
git commit -m "feat: setup express backend and database configuration"
git add public/ src/
git commit -m "feat: setup nextjs frontend components and pages"
git add .
git commit -m "docs: add project documentation and final touches"
git branch -M main
git remote add origin https://github.com/nims-creation/MyLinkedIn.git
git push -u origin main

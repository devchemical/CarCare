# 🔧 Git User Configuration Guide

## Multiple Git Users Setup

This guide explains how to configure multiple Git users for different projects, as implemented in the CarCare repository.

### Current Configuration

#### Global Git User (Default)
```bash
git config --global user.name "Alejandro Bayon"
git config --global user.email "alejandro.bayon@kairosds.com"
```

#### Local Git User (CarCare Project)
```bash
# Navigate to CarCare project directory
cd /path/to/CarCare

# Set local user configuration
git config user.name "DevChemical"
git config user.email "abayonburgos@gmail.com"
```

### How It Works

- **Global Configuration**: Used by default for all Git repositories
- **Local Configuration**: Overrides global settings for specific projects
- **Priority**: Local settings take precedence over global settings

### Verification Commands

```bash
# Check current user configuration
git config user.name
git config user.email

# Check global configuration
git config --global user.name
git config --global user.email

# List all configuration
git config --list --show-origin
```

### Setting Up New Projects

For any new project where you want to use a specific identity:

```bash
# Navigate to project directory
cd /path/to/new-project

# Configure project-specific user
git config user.name "Your Project Identity"
git config user.email "project-email@example.com"
```

### Benefits

- ✅ **Professional Identity**: Use work email for professional projects
- ✅ **Personal Identity**: Use personal email for personal projects
- ✅ **Automatic Switching**: No need to remember to change settings
- ✅ **Commit Attribution**: Proper attribution in commit history
- ✅ **Team Collaboration**: Maintain consistent identity per project

### Example Workflow

```bash
# Work on professional project
cd ~/work/professional-project
git commit -m "feat: add new feature"
# Commits with: Alejandro Bayon <alejandro.bayon@kairosds.com>

# Work on personal project (CarCare)
cd ~/personal/CarCare
git commit -m "feat: improve README"
# Commits with: DevChemical <abayonburgos@gmail.com>
```

### Advanced Configuration

For even more advanced scenarios, you can use conditional includes in your global Git config:

```bash
# Edit global Git config
git config --global --edit

# Add conditional includes
[includeIf "gitdir:~/work/"]
    path = ~/.gitconfig-work
[includeIf "gitdir:~/personal/"]
    path = ~/.gitconfig-personal
```

Then create separate config files:

```bash
# ~/.gitconfig-work
[user]
    name = Alejandro Bayon
    email = alejandro.bayon@kairosds.com

# ~/.gitconfig-personal
[user]
    name = DevChemical
    email = abayonburgos@gmail.com
```

This setup automatically selects the appropriate user based on the directory structure.
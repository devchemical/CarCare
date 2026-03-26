---
name: github-create-pr
description: Create Pull Requests in GitHub repositories. Use when asked to "create a PR", "open a pull request", "submit changes", or when the user wants to merge their current branch. Automatically detects the base branch from which the current branch was created.metadata:
  author: custom
  version: "1.0.0"
  date: March 2026
---

# GitHub Pull Request Creation

This skill helps create well-structured Pull Requests in GitHub repositories with automatic detection of the base branch and comprehensive change summaries.

## When to Use

Use this skill when:

- The user asks to create a PR or pull request
- The user wants to submit changes for review
- The user says they're ready to merge their work
- The user wants to open a pull request from their current branch

## How It Works

1. Detect the current branch and its base branch (the branch it was created from)
2. Gather information about the changes (commits, files modified)
3. Generate a PR title and description with two sections:
   - **Summary**: A brief overview of the changes
   - **Changes**: A list of the most relevant changes with context
4. Push the branch to remote if needed
5. Create the PR using GitHub CLI (`gh`)

## Workflow

### 1. Analyze Current Branch State

Run these commands in parallel to understand the current state:

```bash
git branch --show-current                                    # Get current branch name
git rev-parse --abbrev-ref HEAD                              # Confirm current branch
git log --oneline --graph --decorate --all -20               # View recent commit history
git status                                                   # Check for uncommitted changes
git rev-parse --abbrev-ref --symbolic-full-name @{upstream}  # Check if tracking remote
```

### 2. Determine Base Branch

To find the branch from which the current branch was created:

```bash
# Method 1: Find the merge base with common base branches
for branch in main master develop dev; do
  if git rev-parse --verify $branch >/dev/null 2>&1; then
    echo "$branch: $(git merge-base HEAD $branch)"
  fi
done

# Method 2: Check git reflog for branch creation
git reflog --all | grep -E "checkout:|Branch:" | head -20

# Method 3: Use git merge-base to find common ancestor
git log --first-parent --oneline --ancestry-path HEAD...main 2>/dev/null | tail -1
```

**Selection Priority**:

1. If `main` exists and has a merge base with current branch → use `main`
2. If `master` exists and has a merge base with current branch → use `master`
3. If `develop` exists and has a merge base with current branch → use `develop`
4. If `dev` exists and has a merge base with current branch → use `dev`
5. Ask the user if none of the above work

### 3. Review Changes

Analyze all commits and changes that will be included in the PR:

```bash
# Get commits between base and current branch
git log <base-branch>..HEAD --oneline --no-merges

# Get detailed commit messages for context
git log <base-branch>..HEAD --format="%h %s%n%b" --no-merges

# Get list of changed files
git diff --name-status <base-branch>..HEAD

# Get diff statistics
git diff --stat <base-branch>..HEAD
```

### 4. Generate PR Content

Based on the analysis, create:

#### Title Format

```
<type>: <brief description>
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test changes
- `chore`: Build/config changes

#### Description Format

```markdown
## Summary

Brief description (2-4 sentences) explaining what this PR does and why.

## Changes

- **<file/pattern>**: Description of change and its purpose
- **<file/pattern>**: Description of change and its purpose
- ...

<!-- Optional sections -->

## Testing

How to test these changes...

## Related Issues

Fixes #XXX, Relates to #YYY
```

### 5. Create the PR

Steps to execute:

1. **Push branch if needed**:

   ```bash
   git push -u origin <current-branch>
   ```

2. **Create PR using GitHub CLI**:

   ```bash
   gh pr create \
     --title "<generated-title>" \
     --body "<generated-description>" \
     --base <base-branch> \
     --head <current-branch>
   ```

3. **Return the PR URL** to the user

## Important Notes

- **NEVER commit changes** unless explicitly asked by the user
- Always verify the base branch is correct before creating the PR
- If there are uncommitted changes, ask the user if they want to commit them first
- If the current branch doesn't track a remote, push it with `-u` flag
- Use `gh pr create --draft` if the user mentions the PR is a work in progress
- If `gh` CLI is not available, use the GitHub API or ask the user to create manually

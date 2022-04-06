# Go Nav Bar

 "Go Nav Bar" adds editor title menu items for go navigation commands and other useful commands.

## Editor Title Menu Buttons

Editor title menu buttons include:

- Go -> Forward
- Go -> Back
- Go -> Last Edit Location
- Go -> Go to Bracket
- File -> Save without Formatting

![Go Nav Bar Screenshot](/images/go_nav_bar_screenshot.png)

## Extension Settings

This extension contributes the following settings:

- `GoNavBar.goForward`: show icon for 'Go Forward'
- `GoNavBar.goBack`: show icon for 'Go Back'
- `GoNavBar.goLastEditLocation`: show icon for 'Go Last Edit Location'
- `GoNavBar.goToBracket`: show icon for 'Go To Bracket'
- `GoNavBar.saveWithoutFormatting`: show icon for 'Save Without Formatting'

## Known Issues

All buttons use the default VSCode keybindings.  There is currently no support for changed keybindings  This is on purpose to display the keybinding hover over information.  The original idea was to make it easy to train myself on the VSCode shortcuts eventually removing the need for this extension.

## Release Notes

### 0.0.1

Initial release of go-nav-bar

### 0.2.0

Updated menu items to use "enablement" instead of "when".  This causes icons to be enabled/disabled instead of added/removed to provide a more consistent editor toolbar.

### 0.2.1

Updated mac keybindings to be VSCode defaults.

### 0.2.2

Updated readme and yarn packages.

### 0.3.0

Added "Balance Inward" and "Balance Outward" shortcuts.

### 0.6.0

Updated packages and added web extension support.

### 0.7.0

Updated readme.

### 0.9.0

Updated vscode target to be ^=1.61

## Adding new Icons

Add both icons dark #C5C5C5 and light #424242 to images/ folder

Icons can be found here:

- [Google Font Material Icons](https://fonts.google.com/icons?selected=Material+Icons)
- [Material Design Icons](https://materialdesignicons.com/)
- [Flat Icon](https://www.flaticon.com/)

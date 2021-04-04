# Go Nav Bar README

This is the README for your extension "Go Nav Bar". After writing up a brief description, we recommend including the following sections.

## Features

Adds editor title menu items for go navigation commands and other useful commands including:

- Go -> Forward
- Go -> Back
- Go -> Last Edit Location
- Go -> Go to Bracket
- File -> Save without Formatting

![Go Nav Bar Screenshot]('/images/go_nav_bar_screenshot.png')

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

## Adding new Icons

Add both icons dark #C5C5C5 and light #424242 to images/ folder

Icons can be found here:

- [Google Font Material Icons](https://fonts.google.com/icons?selected=Material+Icons)
- [Material Design Icons](https://materialdesignicons.com/)
- [Flat Icon](https://www.flaticon.com/)

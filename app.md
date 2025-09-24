# Train Car Logger App
I want to build an app to log which train cars I’ve been on in the New York City subway. This will be web app whose focus is on simplicity and speed of use. It should be as easy as possible to log a train car, so I’m incentivized to do it more often. It should be optimized for mobile use. It should be possible to see a table with all the data that’s been logged thus far.

## Technology
- The web app will use React with Typescript
- The web app does not need a backend. Everything can be run locally
- Choose the most commonly used routing framework for React in order to do routing of the app
- The web app will use Tailwind for styling

## Storage
The web app will use localStorage to store all the data, in JSON format.

The localStorage will look like this:
```
{
	data: [
		{
			'timestamp' : 1758728240,
			'car' : 3074,
			'line' : 'A'
		},
		{
			'timestamp' : 1758728280,
			'car' : 3056,
			'line' : 'C'
		}
	]
}
```

## User Interface
- The app will open to a screen with a large keypad that allows you to enter the 4-digit train car number and confirm once exactly 4 digits are inputted
- Then the app will move on to a screen that shows each NYC subway line as a round icon arranged in a grid. Press on an icon to choose.
- Finally, the app will show a confirmation page with the car number and the train line, with two big buttons: one button saying “Confirm” the other saying “Cancel”.
- If you press the “Confirm” button, the app logs the data and goes back to the start
- If you press the “Cancel” button, the app does NOT log the data and goes back to the start
- On the start page, there is a button that says “See log”. Pressing this button brings you to a new window where you can see a table with all the data that has been input thus far. There is a “Close” button that brings you back to the start page.


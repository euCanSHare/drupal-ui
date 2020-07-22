# Obiba Progress Bar

Simple progress bar to indicate page loading or Ajax call processing.

## Building

1. Run `bower install` to install `jQuery` into `bower_components`
2. Run `npm install -d` to install the grunt modules
3. Run `grunt` to build the concatenated and minified versions in the project root. To run [jshint](http://www.jshint.com) continually on file changes in the `src` directory, run `grunt watch`

## Usage

To show a simple page loading:
```javascript
bar = new $.ObibaProgressBar();
bar.start();

$(document).ready(function () {
  bar.finish();
  ready = true;
});
```

To show an Ajax call in progress:
```javascript
  $(document).ajaxStart(function () {
    bar.start();
  });
  
  // after each Ajax call advance the bar by 5 percent 
  $(document).ajaxComplete(function () {
    bar.inc(5);
  });

  $(document).ajaxStop(function () {
    bar.finish();
  });
```
## Public functions
    start: renders the UI and starts the animation,
    pause: pauses the bar and spinner animation,
    resume: resume the bar and spinner animation,
    finish: ends the animation,
    inc: increments the progress by a given percentage (0..100) without stopping the animation
    set: sets the progress by a given percentage (0..100) and stops the animation
    duration: speeds up or down the animation by changing the remaining duration
    
## Configuration 

These properties can be set at construction time:

- **duration**: animation duration in ms - *default: 15000*
- **showSpinner**: true/flase - *default: true*
- **parent**: a selector - *default: 'body'* 
- **template**: two html elements with attributes role='bar' and role='spinner' each
- **barCssOverride**: css properties to override the default styling of the bar
- **spinnerCssOverride**: css properties to override the default styling of the spinner
- **iconCssOverride**: css properties to override the default styling of the spinner's icon

Below is an example of a css overriding:
```javascript
var bar = new $.ObibaProgressBar({
    barCssOverride: {
      background: '#ff0000'
    },
    spinnerCssOverride: {
      top: 300,
      iconCssOverride: {
        width: '30px',
        height: '30px',
        'border-top-color': '#222'
      }
    }
  }
);
```

Schema Form Radio Group Collection Add-on
===================================

**sf-radio-group-collection** add-on

Installation
------------

```
$ bower install sf-radio-group-collection --save
```

Alternatively:

```
$ bower install https://github.com/obiba/sf-radio-group-collection.git#<release-number> --save
```


Make sure to include `sf-radio-group-collection.min.js` in your index file and load the module in your application:

```
var myModule = angular.module('myModule', [
 ...
 'sfRadioGroupCollection',
]);
```

Usage
-----

The schema:

```
{
  "type": "object",
  "properties": {
    "option": {
      "type": "object",
      "format": "radioGroupCollection",
      "title": "Tell us about yourself",
      "values": {"yes": "Yes", "no": "No", "n/a": "N/A"},
      "items": [
        {
          "name": "Are you married?", "key": "are_you_married"
        },
        {
          "name": "Are you happy?", "key": "are_you_happy"
        },
        {
          "name": "Do you drink red wine?", "key": "do_you_drink_red_wine"
        },
        {
          "name": "Do you have a horse?", "key": "do_you_have_a_horse"
        }
      ]
    }
  }
}
```

The Definition:

```
{
  "type":"radioGroupCollection",
  "key":"option",
  "required": true
}
```

Alternatively, you can alter the definition as below to validate that all options are selected:

```
{
  "type": "radioGroupCollection",
  "key": "option",
  "required": true,
  "validationMessage": {
    "allItemsSelected": "You must answer all questions."
  }
}
```

To provide custom values you need to provide them in the schema "values" section:

```
"values": {"yes": "Yes", "no": "No", "n/a": "N/A"}
```

or

```
"values": {"ham-en": "Ham", "ham-fr": "Jambon", "ham-es": "Jamón", "ham-it": "Prosciutto", "ham-ru": "ветчина"}
```

If you would need to use checkboxes instead a definition configuration such as
```
{
  "type": "radioGroupCollection",
  "key": "option",
  "checkboxMode": true
}
```

would show checkboxes instead of radios. The "values" schema field would be useless in this case.
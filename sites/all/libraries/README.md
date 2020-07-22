# Mica Drupal JavaScript Libraries

This repository contains all JavaScript dependencies used by **mica-drupal7** as a means of removing all dependencies on **Node**, **Bower** and **Git**.   

To update the repository correctly you need to follow these steps:

- Make sure these projects are up-to-date:
```
mica2-home
mica-drupal7
```
- To add any new libraries to **mica-drupal7**, proceed as before, i.e., update the **bower.json** with new libraries and modified versions.
- In **mica2-home** start a clean build by executing:
```
make drupal
```
- Once the build was completed successfully and the site was properly QA-ed, you can deploy the newly added dependencies by executing:
```
make deploy-dependencies 
```

This command will commit all the downloaded libraries to this repository.

For now the tagging is not automated so in case you need to create one, do it in Github.





 

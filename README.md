# viSQL

Hi! If you are curious and want to check this out to run it on your machine, follow these instructions:

### Set up a simple webserver
Having Python installed anyway? Do this:
```python
python -m SimpleHTTPServer 9090
```
Using OSX and dont want to use Python? I recommend the free version of MAMP.
Using Windows and Linux, there is LAMPP and XAMPP which are slightly larger, slower and more of a pain in the ass to set up. Your choice. :)

### Check out this repo
Preferably into the htdocs (or similar web root of your server) folder into its own near subfolder "visql".

### Open localhost/visql/index.htm
You are ready. Enter statements in the console-alike input at the top and run by hitting <ENTER>

### Some examples for tables
You can then enjoy some basic example tables, based on which context you are. Click the handle on the left to open options, switch to 2D or 3D context there (cube = 3D, plane = 2D).

##### 2D
This is the "dummy" table
```SQL
select * from dummy
```
An image of a Rubiks Cube.
```SQL
select * from CUBE
```
The release party logo \o/
```SQL
select * from EVOKE
```
Rotate this image by switching X and Y coordinates
```SQL
select y as x, x as y, r,g,b,a from CUBE
```
Select and show only some color values
```SQL
select x,y,r,g,b,a from CUBE WHERE r>200 and b<100
```
Show equalizer reading from music
Do not forget to switch on the music via the options menu!
```SQL
select * from MUSIC
```
Union of Evoke 2016 logo with equalizer
Do not forget to turn on music in options menu!
```SQL
select * from MUSIC UNION select * from EVOKE
```
Video feed
Do not forget to turn on video in options menu!
```SQL
select * from VIDEO
```
Motion detection
Do not forget to turn on video in options menu!
```SQL
select VIDEO.x, VIDEO.y, MOVE.r, VIDEO.g, VIDEO.b from VIDEO,MOVE where VIDEO.x=MOVE.x and VIDEO.y=MOVE.y
```

##### 3D
Based on our logo, this is a complex table containing hardcoded values ro represent the characters S, G and 4
```SQL
select * from SG4
```
Random Rubiks Cube
```SQL
select * from CUBE
```
3D equalizer in UNION with Rubiks Cube with only some color values selected
Do not forget to turn on music in options menu!
```SQL
SELECT * FROM CUBE WHERE b>100 UNION select * from MUSIC
```
Webcam video feed in 3D (**this is the most fun in my opinion**)
Do not forget to turn on video in options menu!
```SQL
SELECT * FROM VIDEO
```

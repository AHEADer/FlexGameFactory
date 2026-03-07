##  RES-19 Dice Selection
    
![figure_373_234_697_595](https://tosv.byted.org/obj/labcv-ocr/Seed_PDF_figures/figure_2024_10_19_17_3_3_18_373_234_697_595.jpg)
    
###  Description
 Player rolls multiple dice and selects one based on a rule.    
###  Discussion
 In this Dice Selection mechanism, players roll a set number of dice and choose one of them to represent the result. The most common implementation ofthis has players roll two dice and select the highest or lowest. Dungeons  Dragons uses this system and refers to the two states as "advantaged" and "disadvantaged." An alternative is for players to roll three dice, and to choose the median die.    
 A High/Low selection is a way for designers to skew single die results fairly significantly towards the high or low end. Conversely, a median selection system makes extreme results unlikely.    
    
<table><tr><td>Result</td><td>1 Die</td><td>2 Dice, High (\%)</td><td>2 Dice, Low (\%)</td><td>3 Dice, Median (\%)</td></tr><tr><td>1</td><td>16</td><td>3</td><td>31</td><td>7</td></tr><tr><td>2</td><td>16</td><td>8</td><td>8</td><td>19</td></tr><tr><td>3</td><td>16</td><td>14</td><td>19</td><td>24</td></tr><tr><td>4</td><td>16</td><td>19</td><td>14</td><td>24</td></tr><tr><td>5</td><td>16</td><td>25</td><td>8</td><td>19</td></tr><tr><td>6</td><td>16</td><td>31</td><td>3</td><td>7</td></tr></table>
    
 The table above shows the chances of rolling diferent numbers with a standard die rol, rolling 2 dice and selecting the highest (or lowest), and rolling 3 dice and selecting the middle value. Rolling 2 dice and selecting thehighest almost doubles the chances of a result of 6 , and a result of 1 is $80 \%$  less likely than with a standard die roll. Selecting the middle out of 3 dice emphasizes results of 3 and 4, while cutting the chances of a 1 or 6 in half compared to standard roll.    
 Root presents a related system, where 2 dice are rolled for battles, with the Attacker taking the higher roll, and the defender the lower. This encourages aggression.    
##  Sample Games
13th Age (Heinsoo and Tweet, 2013)    
Dungeons & Dragons (Arneson and Gygax, 1977)    
Root (Wehrle, 2018)    

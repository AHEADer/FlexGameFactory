##  ACT-06 Action Queue
    
![figure_134_234_936_636](https://tosv.byted.org/obj/labcv-ocr/Seed_PDF_figures/figure_2024_10_19_17_1_28_544_134_234_936_636.jpg)
    
##  Description
 Players create Action Queues and perform them in sequence.    
##  Discussion
 While this mechanism has many different implementations, at its core, the idea is that players must plan their actions and commit to a specific sequence of execution. For example, players may have to plot the movement of a robot by placing three Action cards in sequence that may, for example, cause the robot to move forward two spaces, then turn left, then move one more space. The types of actions, the way they are revealed and resolved, and other specifics have several variations.    
 Action Queues emphasize planning, but can also introduce chaos, as players commit to a course of action several steps or turns in advance, keep them hidden from the other players, and have limited opportunity to change the plan. This introduces Yomi (UNC-01), as players try to guess what other players will do and what the board state may look like in the future.    
 Actions are typically represented by cards, as they can contain a lot of information about the preconditions and resolution. Tiles can also be used but need to be simpler. Queues can either be Rolling, where the Action at the head of the queue is revealed and performed as a new Action is added to the    
 end, or Batch, where a set number of cards are added to the queue at one time, and then all are resolved in order.    
 One of the earliest uses of a Rolling Queue is the 1965 game Nuclear War. In this game, each player has a queue of two cards in front of them. On their turn, they add a card to the end of the queue, and then turn up and execute the card at the queue head. In Nudlear War the players start at peace and may perform certain peace actions, but when someone launches a missile, only war actions may be taken. The delayed Action Queue gives the game tremendous tension, as players need to decide if they can continue to perform peace actions or want to be the first to declare war.    
 RoboRally uses a Batch Queue. The players fully plan an entire series of actions and then resolve them using an Interleaved turn structure, with each player revealing and performing the action in the first slot, then each player doing the second action, etc. Swasbbuckler, instead of cards, has players record their actions in blocks of six time steps on a record sheet. Players then resolve each time step in a similar way.    
 Robo Rally only allows for the players to queue Movement actions, with others (like shooting) being done on-the-fly as the opportunity permits. In contrast, Swasbbuckler allows players a full suite of movement, combat, and other actions.    
 Twin Tin Bots uses a Batch Queue approach, but the entire queue does not get replaced at once. Players may only replace one Action in the queue each turn. The others remain and are performed. This obviously adds more complexity to the programming step as players need to play further ahead about how they may change of their queues. Mechs us. Minions is a similar example of this system.    
 When queues get longer, and particularly when movement and rotation actions are included in the available actions, this mechanism may require good spatial relations in the players, as they need to visualize where they will be as they progress through the queue. This can give games a heavier feel, while at the same time increasing the chaotic feel. This combination may not be well received by some players, although some games, like Robo Rally and Space Alert, rely on this for their experience.    
 Other games, like Colt Express, address this challenge by limiting the overall movement space. In Colt Express players can move to the head or rear of a short train of cars, or between the inside and the top of those cars. Each player can move to one of three spaces per turn, and the whole board is about ten spaces (depending on player count), increasing the likelihood of player collisions and interactions.    
 Root has a unique take on the Action Queue, as one of the factions must add a new Action to the queue each turn (in any position) and perform all the Actions in sequence. Ifan Action cannot be executed, the player loses victory points, and all Action cards are discarded. Another variation is in Valparaiso. Players simultaneously plan their actions in a queue, and then execute them in order. However, as the turn unfolds they may pay gold to perform an action in their queue sooner than planned.    
##  Sample Games
Rolling Queue:    
The Dragon & Flagon (Engelstein, Engelstein, and Engelstein, 2016)    
Killer Bunnies and the Quest for the Magic Carrot (Bellinger, 2002)    
Nuclear War (Malewicki, 1965)    
Batch Queue:    
Colt Expres (Raimbault, 2014)    
Gunslinger (Hamblen, 1982)    
Mechs us. Minions (Cantrell, Ernst, Librande, Saraswat, and Tiras, 2016)    
Robo Rally (Garfield, 1994)    
Root (Wehrle, 2018)    
Space Alert (Chvátil, 2008)    
Swasbbuckler (O'Neill and Taylor, 1980)    
Twin Tin Bots (Keyaerts, 2013)    
Valparaiso (Malz and Malz, 2018)    

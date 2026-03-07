##  ACT-09 Order Counters
    
![figure_214_234_855_729](https://tosv.byted.org/obj/labcv-ocr/Seed_PDF_figures/figure_2024_10_19_17_1_36_895_214_234_855_729.jpg)
    
###  Description
 Players place Order Tokens into regions, indicating what they want to do in that particular region of the board. After all tokens are placed, they are executed in sequence.    
###  Discussion
 This mechanism combines an Interleaved Turn Structure (TRN-15) with an Action Queue. Players are in essence creating multiple Interleaved Action Queues during a planning step, and then resolving them. The tokens are typically placed face down, so opponents know where you are planning to do actions, but not which, and if more than one order may be given, tokens are placed in a stack to indicate their sequence.    
 Because players alternate placing orders into different areas, they must balance a variety of factors. Which actions do they wish to do early? Will committing to a region aler an opponent to your intentions to operate there? What action are the opponents planning?    
 The resolution of the Order Token stacks can be performed in several ways. First, they may either be resolved from the top down, so that tokens that were placed last are resolved first (LIFO: Last-In-First-Out), or the token    
stack may be flipped over, so that the earliest tokens are resolved first (FIFO: First-In-First-Out). Some games (like A Game of Tbromes: The Board Game), don't consider the placement order of the tokens, and simply turn them all over and resolve them in a specific Action order.    
 Resolution order has great impact on the strategy and feel for placement. LIFO gives the game a "chicken" feel, as players want to be the last into a region with key actions so that they are executed first, but it also increases cognitive load, as players need to remember the reverse order of tokens in the stack and modify their plans as they go. With a FIFO structure, players can gradually just build up their plans in their minds as they proceed, which is less cognitively taxing.    
 Either way, this is a moderately complex mechanism which is best reserved for heavier strategy games.    
##  Sample Games
Forbidden Stars (Bailey, Kniffen, and Konieczka, 2015)    
Francis Drake (Hawes, 2013)    
A Game of Thrones (Petersen and Wilson, 2003)    
Starcraft: The Board Gamme (Konieczka and Petersen, 2007)    

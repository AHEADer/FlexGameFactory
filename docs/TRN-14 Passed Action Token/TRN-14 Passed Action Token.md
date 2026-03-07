##  TRN-14 Passed Action Token
    
![figure_261_237_810_769](https://tosv.byted.org/obj/labcv-ocr/Seed_PDF_figures/figure_2024_10_19_17_1_2_290_261_237_810_769.jpg)
    
###  Description
 Players possess one or more Action Tokens. Those who have an Action Token may take a turn, then they pass the token clockwise, allowing the next player to perform an action. Actions are performed in real time; there is no pausing and structure within the turn.    
 Typically, to prevent stalling and to keep the game moving, in games with multiple Action Tokens, if both tokens are held by the same player, then they suffer a penalty.    
##  Discussion
 This mechanism is a cross between a real-time-based and a turn-based game. Similar to the Action Timer mechanism (TRN-12), it allows players to play at their own pace, and asynchronously, but gives some structure.    
 However, in the Action Timer mechanism, the players are basically independent of each other, and can operate simultaneously. Here, players are linked more closely, in that your turn can only start when the player before you in turn order finishes his or her turn. This helps solve the dilemma of players breaking rules (either inadvertently or deliberately) that is present in    
 other real-time mechanisms by having some players be inactive and able to watch what other players are doing and interrupt if necessary. This allows for more complex mechanisms within the game itself as opposed to traditional real-time games.    
 For the most part, in order for this mechanism to work, there needs to be muliple Action Tokens being passed around the circle at the same time. The exception is if the round itself is timed in some fashion and having possession of the Action Token causes a player to lose. Hot Potato and Catch Phrase! are examples of this, where the player holding the item when time runs out loses.    
 When using multiple Action Tokens, a key design element is what happens if multiple tokens end up with the same player. In Camelot, if another token would be passed to a player who already has one, it instead skips that player and goes to the person to his or her left. This is equivalent to losing a turn, as other players will get to act a second time before the affected player. While we recommend against players losing a turn and classify it as an anti-pattern (TRN-16), in this case the opportunity to avoid losing a turn lies with the player, and is not luck-based. Therefore, it is an understandable and satisfying solution to use in this case. It forces players to move at a reasonable pace, at least comparable in speed to the other players.    
 Yet, it does not mean that fast players will always win, depending on the design of the game. If a reasonably thought out single move will beat a hasty double move, then the system will be fine, as just doing something as quickly as possible will not be rewarded. The players will need to balance "optimal" and "good enough."    
 An alternative system is seen in Diner. In this game, if a second Action Token ends up with the same player, it just sits there until he or she completes his or her move, and pass the first token to the next player. There is no "lapping" as there is in Camelot. This can lead to slower and more conservative play, but in this game it is helped by forcing players to compete to take shared cards in a central tableau, so playing slowly in general will allow the other players to grab more desirable cards.    
 It is also possible to use this as an overlay or subset of another structure. Space Cadets uses a real-time turn structure, but in certain situations an Action Token (a small deck of cards in this case) is passed around to allow players to perform a special action beyond what they can normally do.    
 Edlipse uses two Action Tokens in a variant mode that can accommodate as many as 9 players. The only distinction between the tokens is that one    
 provides priority over the other for acquiring new technologies. The system is surprisingly effective at speeding along what would otherwise be an unplayable behemoth of a game.    
##  Sample Games
Camelot (Jolly, 2005)    
Catch Phrase! (Uncredited, 1994)    
Diner (O'Malley, 2014)    
Eclipse (rule variant) (Tahkokallio, 2011)    
Hot Potato (Unknown, 1800's)    
Space Cadets (Engelstein, Engelstein, and Engelstein, 2012)    

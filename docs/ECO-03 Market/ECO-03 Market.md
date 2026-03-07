ECO-03    
 Market    
    
![figure_214_233_855_807](https://tosv.byted.org/obj/labcv-ocr/Seed_PDF_figures/figure_2024_10_19_17_4_56_763_214_233_855_807.jpg)
    
##  Description
 Players may buy from or sell resources to Markets, where prices and quantities can vary.    
##  Discussion
 Markets are a specialized form of Exchanging (ECO-01), as players are typically exchanging stocks or commodities for money, all of which are resources. However, there are some specific considerations for this implementation, particularly around changing prices. Note that we are defning a Market mechanism as one where prices change. Mechanisms like that, found in Concordia, where you can buy or sell for a fixed value throughout the game would fall under Exchange, even though it is called a Market.    
 One mechanism for varying prices is using a track as in Supremacy, where there is a price track for each commodity, with a marker indicating the current buy/sell price. Ifa player sells that commodity the price is reduced, and if they buy it the price increases. If a player buys or sells multiple units, all units can    
 either be sold at the same price prior to adjustment (as in Supremac), or it can drop one space with each good sold (as in Crude). While the latter makes it more difficult for players to exploit the system, it makes the calculations a bit more complex.    
 Price tracks can be 2-dimensional grids, as in the I8xx series. In those games, selling shares makes prices move down within a pricing column, while issuing dividends moves it to another column with a different price scale. This gives more fine-grained control to the design, and there can be special effects when the price hits the top or bottom of a row or column.    
 Rather than have a marker record the current price, the actual commodity tokens can do so. This is done by placing one commodity per space on the pricing track. The price of the commodity is based on the farthest space up the track covered by the commodity, or sometimes the farthest visible space. As commodities are bought, higher price spaces are revealed, and as they are sold, the higher price spaces are covered so the price drops. Visually, the former method usually calls for numbers to be printed above or below the track spaces, which takes up more room, while the latter allows the numbers to be printed on the track spaces themselves.    
 This elegant track system is used in Crude, Pouwer Grid, and others. When players take a resource off the track, they simultaneously are adjusting the pricing for that resource, without having to remember to do anything else. Wealth of Nations adds a twist in that the buy and sell prices are not the same in each space. There is a delta that creates friction in the market system.    
 Markets can sometimes be one-way ratchets. In Acquire, players may only buy shares from the market, not sell them. And as the hotel chains they represent expand, the price of the shares goes up, and can never go down. In other cases, like Rococo, prices for thread and fabric go down throughout the course of the turn, decreasing as each player makes purchases. This ostensibly models the decline of prices in a bazaar as closing time approaches and is also helpful for balancing firs-player turn-order advantage.    
 Market systems create a lot of player interaction, as playets may attempt to manipulate the price to their advantage or deprive their opponent the ability to gain needed resources. They also help to self-balance resource production. If one resource is being over-produced or under-used by the players, the price will be driven downwards, and players will adjust accordingly. In a system where the physical resource tokens are placed on the market track, they may even become completely unavailable if players are hoarding them.    
##  Sample Games
1830 (Tresham, 1986)    
Acquire (Sackson, 1964)    
Chicago Expres (Wu, 2007)    
Concordia (Gerdts, 2013)    
Crude: The Oil Game (St. Laurent, 1974)    
Greed Incorporated (Doumen and Wiersinga, 2009)    
Power Grid (Friese, 2004)    
Rococo (Cramer, Malz, and Malz, 2013)    
Shark (Vanaise, 1987)    
Stockpile Sobol and Orden, 2015)    
Supremacy (Simpson, 1984)    
Wealth of Nations (Carroll, 2008)    

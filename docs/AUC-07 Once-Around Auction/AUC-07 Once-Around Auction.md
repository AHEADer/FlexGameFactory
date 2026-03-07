AUC-07    
    
![figure_135_231_934_548](https://tosv.byted.org/obj/labcv-ocr/Seed_PDF_figures/figure_2024_10_19_17_6_2_263_135_231_934_548.jpg)
    
 Once-Around Auction    
##  Description
 The players each have one opportunity to bid, either passing or raising the prior bidder. The order of bids is determined by one of the Turn Order structures. After the last player has their opportunity to bid, the high bidder wins.    
##  Discussion
 The Once-Around Auction structure takes a straightforward approach to shortening auctions by simply collapsing the whole auction into one round. This works very well for speeding the auction, but it does have disparate impacts on players depending on their position in the turn order. The first player is faced with the substantial challenge of making a bid without any other information. Their bid will set the market and is vulnerable to being outbid by any player, who can bid as little as one dollar more. By contrast, the last player in turn order has perfect information. They know exactly how much to bid to win the lot. Often, the player in the next-to-last place is faced with a lot that is relatively inexpensive, but which they don't actually want. However, they feel like they must police the auction and raise the bid to prevent the last player from getting a windfall.    
 Whether the strong left-right binding (the term used to describe games that are strongly impacted by turn order, and specifically, the players seated to the right and left of a given player) of this mechanism is positive or negative is largely a matter of perspective, but it is something to design around. For example, turn order can itself be priced in such a manner that the advantage provided by going last in the auction is accounted for. Alternatively, going    
 first in other aspects of the game may be quite powerful, to help balance the disadvantage of going first in the auction.    
 Another approach is to use constrained bids that require bidders to raise the current winning bid by a more substantial increment, or to provide the first bidder with the right to match the final bid and take the lot.    
 Once-Around Auctions aren't that common in modern designs, having been superseded by Sealed-Bid Auction (AUC-04) that are agnostic to turn order, or by drafting mechanisms that eliminate the role of currency entirely. Generally, they should be used when tight coupling to turn order is desirable and turn order is central to the design.    
##  Sample Games
Medici (Knizia, 1995)    
Modern Art (Knizia, 1992)    
New Amsterdam (Allers, 2012)    
Tin Goose (Clakins, 2016)    

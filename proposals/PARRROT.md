# PARRROT: The Publisher Auction Responsibility Retention Revision of TurtleDove

## Introduction

A programmatic auction for any given ad impression must consider many more factors than bid price.  Within the publisher/SSP set up there exists a long list of potentially contributing factors: domain, creative or buyer blocks, prioritization, buying models, pacing, whether or not the impression is eligible for a Deal and if so how that Deal affects the relevance of bid price, regional factors, day parting, targeting, custom parameters; this list can be quite extensive and vary quite a bit pub by pub and impression by impression.  As such, we think TURTLEDOVE could be improved further by allowing the Publisher to retain control of the auction. In fact this is imperative for the reasons listed here.

The details provided are intended to help conceptualize how this could work.

## Proposed Workflow
### Page Load and Standard Auction

Many publishers today deploy javascript on their page that collects some information and makes requests to multiple SSPs, integrates with their ad serving platform and fills ad space on the page. This is commonly referred to as header bidding. This header bidding javascript could be updated by vendors to support PARRROT with minimal impact to individual publishers.

The header bidding code would make ad requests and integrate with the ad server as it does today. Based on ad responses and data returned from the ad server, the header bidding code could determine if making a TURTLEDOVE request is appropriate. Perhaps there is a high value direct sold ad that supersedes any programmatic campaigns and this ad should be rendered immediately. However, when the publisher’s business logic indicates that TURTLEDOVE overhead could provide valuable demand, the header bidding code would initiate the TURTLEDOVE flow.

### TURTLEDOVE Flow

When TURTLEDOVE is indicated, the header bidding code could render a variant of a fenced frame passing in contextual bids and ad server data. 

```
<fencedFrame src=”headerbidding/turtledove.js” data={...bids, ...adServerData} context="TURTLEDOVE" />
```

The fenced frame would prevent any communication between the frame and the external page as well as any network requests.

The code or web bundle loaded into this fenced frame, which could also be managed by the header bidding vendor, would have access to initiate to retrieve TURTLEDOVE interest group bids for each participating SSP (this might include TERN-like cached bids or access to a DoveKey store).

The code would then execute any configured business logic, using available contextual, interest group and ad server data, resolve any ad quality rules, and run a final auction to choose the winning ad.

Once the winning ad is chosen, some reporting data about the decision could be sent using the aggregate reporting API.

Finally, the winning ad is rendered using a nested fenced frame.

### Preventing Data Leakage

In order to ensure that interest group info is not leaked in cases where the contextual ad wins, only the exact url provided to the fenced frame in one of the competing bid objects can be used to render the ad. This will prevent the interest group from being appended via link decoration to the contextual creative url.

Likewise, to prevent leakage of contextual info in cases where the interest group wins, only the exact url returned from one of the contextual methods (TURTLEDOVE, TERN, DoveKey, ect..) can be used to render the ad.

## Diagrams
### Sequence Diagram
![Sequence Diagram](https://user-images.githubusercontent.com/14223042/98175518-0282b880-1eb4-11eb-8095-e17a1a765843.png)

### Interaction Diagram
![PARRROT_Flow](https://user-images.githubusercontent.com/14223042/98175522-044c7c00-1eb4-11eb-8861-338bcb8d4c41.png)


1. Publisher deploys some custom JS to their page to control ad serving (much like prebid.js)
2. Custom javascript initiates contextual requests from multiple SSPs including contextual info and first party ids (as happens today)
3. SSPs get bids from DSPs and perform contextual auction, returning winning bid and contextual ids
4. Custom JS generates a variation of a fenced frame which has access to the SSP responses as well as the interest groups and the DoveKey store, but otherwise no networking or storage access.
5. Custom JS is loaded within this fenced frame which queries dovekey 
6. Custom JS compares interest group bids to contextual bids of the SSPs and chooses a winner.
7. Aggregate reporting API would be available to send metrics back to publisher/SSP/advertiser in privacy safe way
8. Winning ad is rendered in a nested fenced frame which cannot access any of its parent

## Open Questions
### Regarding PARRROT

### Server Side Compatibiliity

PARRROT, like TURTLEDOVE, requires a lot of client side data and computation in order to serve an ad. Would it be possible to perform a similar function server-side while still achieving the necessary privacy levels?

### Regarding TURTLEDOVE
#### Reporting

Reporting is still an issue. At the moment the Aggregate Reporting API seems to be the only option available. PARRROT suffers from the same limits placed on reporting in TURTLEDOVE. We believe that the sparrow proposal offers an excellent solution for reporting which could be extracted into an independent, audited, server-side entity to provide the needed granularity in a privacy focused way.


## Comparisons to
### Vanilla TURTLEDOVE

#### Auction Control

In TURTLEDOVE, the browser controls the auction. Details have not been completely flushed about, but it appears only a single SSP could offer a decision function. We believe PARRROT improves this by placing the decision logic in the publishers hands with the browser only responsible for controlling what data is available / can leave the browser via fenced frames.

### TERN

[TERN](https://github.com/AdRoll/TERN) expands on TURTLEDOVE to add more details missing from the original proposal, including:

#### In-advance creative approval
Any viable proposal needs to support a mechanism for creative approval. TERN suggests SSPs can approve or deny a creative as submitted by the DSP. While we believe there are some outstanding issues with scalability, this approach seems to be one of the most promising solutions to this challenge.

#### Ad delivery to the browser at interest group assignment time
TERN improves on TURTLEDOVEs independent request for and ad by suggesting it could be delivered immediately to the browser when the user is placed in an interest group. We feel this feature is a valuable improvement to TURTLEDOVE, is compatible with PARRROT, and would be valuable for interest groups with smaller memberships.

#### Support for multiple interest groups
TERN expands TURTLEDOVE to allow advertisers to send multiple interest groups in a single request. We feel this feature is a valuable improvement to TURTLEDOVE, is compatible with PARRROT.

#### DSP controlled bidding
TERN suggests that DSPs should have real-time control over their bids with access to bidding signals. This seems reasonable. PARRROT could be expanded to support bidding functions in addition to static bids.

#### Second price auction
TERN argues that second price auctions are more secure and simpler overall than are first price auctions. PARRROT does not take a stance here, but instead allows the publisher to determine how the auction is managed allowing for either first or second price as needed.

#### Third party tags
TERN proposes supporting reporting to third parties. PARRROT could be expanded simliarly to allow for third party reporting.

### DoveKey

Google recently released a new proposal named [DoveKey](https://github.com/google/rtb-experimental/tree/master/proposals/dovekey) which "simplifies the bidding and auction aspects of TURTLEDOVE by introducing a third-party KEY-value server."

DoveKey improves [TURTLEDOVE](https://github.com/WICG/turtledove/) so that interest group ads can be updated in real time and ad quality controls can be respected. While there are still some outstanding questions about its feasibility we think its a step in the right direction.

It still assumes that the final auction is run by the browser, which we believe should be run by the publisher. 

### Sparrow
[Sparrow](https://github.com/WICG/sparrow/) modifies TURTLEDOVE by bringing several functions out of the browser and onto a trusted server. Those functions are:

#### Interest group bid caching
TURTLEDOVE intends for bids to be cached client side, no guidance was given on the rate at which they could be updated, the assumption has been that bids could not be modified often enough to suit marketers. Within Sparrow the bids themselves would be cached on the gatekeeper.

#### Auction mechanics
While technically not offloaded to the gatekeeper, auction mechanics were offloaded to an SSP, with the gatekeeper stripping out any personal identifying information from the ad request or bid response, effectively acting as a cleaner for interest group ads. 

#### SSP inventory controls
TD made little mention of ways in which a publisher could enforce inventory control through the browser, Sparrow, supported the concept of publisher side inventory controls, the publisher when choosing which gatekeeper to send their interest group ad to could push inventory controls in advance. 

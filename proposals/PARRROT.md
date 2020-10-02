# PARRROT: The Publisher Auction Responsibility Retention Revision of TurtleDove

## Introduction
Dove Key improves TURTLEDOVE so that interest group ads can be updated in real time and ad quality controls can be respected. While there are still some outstanding questions about its feasibility we think its a step in the right direction.

If adopted and concern about scale resolved, the main outstanding issue with TURTLEDOVE would be browser control of the auction.

A programmatic auction for any given ad impression must consider many more factors than bid price.  Within the publisher/SSP set up there exists a long list of potentially contributing factors: domain, creative or buyer blocks, prioritization, buying models, pacing, whether or not the impression is eligible for a Deal and if so how that Deal affects the relevance of bid price, regional factors, day parting, targeting, custom parameters; this list can be quite extensive and vary quite a bit pub by pub and impression by impression.  As such, we think TURTLEDOVE could be improved further by allowing the Publisher to retain control of the auction. In fact this is imperative for the reasons listed here.

The details provided are intended to help conceptualize how this could work.

## Proposed Workflow
### Page Load and Standard Auction

Many publishers today deploy javascript on their page that collects some information and makes requests to multiple SSPs, integrates with their ad serving platform and fills ad space on the page. This is commonly referred to as header bidding. This header bidding javascript could be updated by vendors to support PARRROT with minimal impact to individual publishers.

The header bidding code would make ad requests and integrate with the ad server as it does today. Based on ad responses and data returned from the ad server, the header bidding code could determine if making a TURTLEDOVE request is appropriate. Perhaps there is a high value direct sold ad that supersedes any programmatic campaigns and this ad should be rendered immediately. However, when the publisher’s business logic indicates that TURTLEDOVE overhead could provide valuable demand, the header bidding code would initiate the TURTLEDOVE flow.

### Pre-TURTLEDOVE Flow
As indicated in the Dovekey proposal, SSPs and DSPs will coordinate to inject bids into a key value store. These bids are references with a combination of interest group ids (ig_id) and contextual ids (c_id).

SSPs can validate creatives and apply any ad quality rules prior injecting them into the key value store.

This injection can happen anytime before the SSP responds to the contextual request for the data to be available at the start of the TURTLEDOVE flow.

### TURTLEDOVE Flow

When TURTLEDOVE is indicated, the header bidding code could render a variant of a fenced frame passing in contextual bids and ad server data. 

```
<fencedFrame src=”headerbidding/turtledove.js” data={...bids, ...adServerData} />
```

The fenced frame would prevent any communication between the frame and the external page as well as any network requests.

The code or web bundle loaded into this fenced frame, which could also be managed by the header bidding vendor, would have access to the dove-key store to retrieve interest group bids for each participating SSP.

The code would then execute any configured business logic, using available contextual, interest group and ad server data, resolving any ad quality rules, and running a final auction to choose a winning ad.

Once the ad is chosen, some reporting data about the decision could be sent using the aggregate reporting API.

Finally, the winning ad is rendered using a nested fenced frame.

### Preventing Data Leakage

In order to ensure that interest group info is not leaked in cases where the contextual ad wins, only the exact url provided to the fenced frame in one of the competing bid objects can be used to render the ad. This will prevent the interest group from being appended via link decoration to the contextual creative url.

Likewise, to prevent leakage of contextual info in cases where the interest group wins, only the exact url returned from the DoveKey store can be used to render the ad.

## Diagrams
### Sequence Diagram

### Interaction Diagram

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
### Regarding Dovekey
#### Scalability
The possible number of contextual and interest group id combinations across all SSPs / DSPs could potentially be very large. Some data analysis is needed to understand the magnitude of the data as well as the cost to reducing this set if needed.

Magnite, for example has about 1.2 trillion interest group - inventory active combinations at any given time and as an SSP we likely have far fewer interest groups than DSPs do. It’s likely we would not need the same inventory granularity in the dovekey store as some optimization could be made there, but this give us an initial sense of the scale needed.

### Regarding TURTLEDOVE
#### Reporting

Reporting is still an issue. At the moment the Aggregate Reporting API seems to be the only option available. PARRROT suffers from the same limits placed on reporting in TURTLEDOVE. We believe that the sparrow proposal offers an excellent solution for reporting which could be extracted into an independent, audited, server-side entity to provide the needed granularity in a privacy focused way.


## Comparisons to
### Vanilla TURTLEDOVE
#### Ad Caching

In TURTLEDOVE, advertisers are unable to dynamically update their campaign goals. DoveKey and PARROT improve on this by storing ads server side where they can be globally updated as needed.

#### Auction Control

In TURTLEDOVE, the browser controls the auction. Details have not been completely flushed about, but it appears only a single SSP could offer a decision function. We believe PARRROT improves this by placing the decision logic in the publishers hands with the browser only responsible for controlling what data is available / can leave the browser via fenced frames.

### TERN

Tern expands on TURTLEDOVE to add more details missing from the original proposal, including:

#### In-advance creative approval
Any viable proposal needs to support a mechanism for creative approval. TERN suggests SSPs can approve or deny a creative as submitted by the DSP. PARRROT allows for creative approval when the DSP provides the creative to the SSP for distribution into a DoveKey store, allowing SSP to enable very granular publisher control over which creatives can serve where on their properties.

#### Ad delivery to the browser at interest group assignment time
TERN improves on TURTLEDOVEs independent request for and ad by suggesting it could be delivered immediately to the browser when the user is placed in an interest group. PARRROT and DoveKey allow for the browser to request the ad at request time, allowing the DSP closer to real-time control over their campaigns.

#### Support for multiple interest groups
TERN expands TURTLEDOVE to allow advertisers to send multiple interest groups in a single request. PARRROT and DoveKey do not need advanced network requests to put users into an interest group, but multiple interest groups can be sent to DoveKey for retrieval at ad request time.

#### DSP controlled bidding
TERN suggests that DSPs should have real-time control over their bids with access to bidding signals. This seems reasonable. PARRROT could be expanded to support bidding functions in addition to static bids.

#### Second price auction
TERN argues that second price auctions are more secure and simpler overall than are first price auctions. PARRROT does not take a stance here, but instead allows the publisher to determine how the auction is managed allowing for either first or second price as needed.

#### Third party tags
TERN proposes supporting reporting to third parties. PARRROT could be expanded to allow for third party reporting configuration within the DoveKey store.

### DoveKey

DoveKey modifies key aspects of TURTLEDOVE and Sparrow, including modifications to the sparrow gatekeeper, and where interest group bids are cached. It still assumes that the final auction is run by the browser, which we believe should be run by the publisher. 

### Sparrow
Sparrow modifies TURTLEDOVE by bringing several functions out of the browser and onto a trusted server. Those functions are:

#### Interest group bid caching
TURTLEDOVE intends for bids to be cached client side, no guidance was given on the rate at which they could be updated, the assumption has been that bids could not be modified often enough to suit marketers. Within Sparrow the bids themselves would be cached on the gatekeeper.

#### Auction mechanics
While technically not offloaded to the gatekeeper, auction mechanics were offloaded to an SSP, with the gatekeeper stripping out any personal identifying information from the ad request or bid response, effectively acting as a cleaner for interest group ads. 

#### SSP inventory controls
TD made little mention of ways in which a publisher could enforce inventory control through the browser, Sparrow, supported the concept of publisher side inventory controls, the publisher when choosing which gatekeeper to send their interest group ad to could push inventory controls in advance. 

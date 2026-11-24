/* ===================================================================
   TUNE THE DIAL — an FM dial for pirate and legal dance radio by year.
   Pick a city and a year; the stations the book puts on air that year
   sit at the frequencies the book gives (those without one are listed
   beside the dial). Between stations: generated static. On a station:
   a generated loop in its style from the engine's presets, and a card.
   Every station, frequency, year and event is from the book's own pages
   (data: build/features/dial.data.json, inlined so it works from file://).
   =================================================================== */
(() => {
  const NAME = 'dial';
  const D = (window.FEATURE_DATA && window.FEATURE_DATA.dial) || {"cities":{"london":["London","london"],"detroit":["Detroit","detroit"],"chicago":["Chicago","chicago"],"newyork":["New York","newyork"],"bristol":["Bristol","bristol"]},"st":[{"id":"kiss-fm","n":"Kiss FM","c":"london","pg":"kiss-fm","r":[[1985,1988,94.0,"94 FM","pirate"],[1990,2024,100.0,"100 FM","legal"]],"rs":["kiss-fm","kiss-fm"],"pl":["Soul and dance; rare groove, house, and techno on Colin Dale's Abstrakt Dance","kiss-fm"],"who":["Norman Jay, Colin Faver, Colin Dale, Paul \"Trouble\" Anderson, Jazzie B, Coldcut, Danny Rampling; Graham Gold on the licensed station","kiss-fm"],"sty":"House 1988","yn":null,"ev":[[1985,"on","On air as a soul and dance pirate on 94 FM in October.","kiss-fm"],[1986,"raid","Taken off air so often that it settles into weekend broadcasting.","kiss-fm"],[1987,"raid","Raided 18 times this year.","sy5"],[1988,"off","Closes itself down on 31 December to bid for a licence.","kiss-fm"],[1989,"note","Off air all year; wins a licence on 17 December.","kiss-fm"],[1990,"legal","Back on 1 September as a licensed station on 100 FM; Norman Jay hosts the first full show.","kiss-fm"],[2006,"note","Fined £175,000 by Ofcom in June, as a legal station.","kiss-fm"],[2024,"off","Gives up its London FM frequency in September.","kiss-fm"]],"x":null,"u":0},{"id":"centreforce","n":"Centreforce 88.3","c":"london","pg":"centreforce","r":[[1989,1990,88.3,"88.3 FM","pirate"],[2007,2007,88.4,"88.4 FM, a summer comeback","comeback"]],"rs":["centreforce","centreforce"],"pl":["Acid house, 24 hours a day; the first seven-day rave station by its own claim","centreforce"],"who":["Set up by Andy Swallow; Roger the Dodger, Kenny Ken, Randall, Keith Mac, Gary D, Danielle & Rochelle, Linden C","centreforce"],"sty":"Chicago acid 1987","yn":null,"ev":[[1989,"on","On air from Newham on Monday 8 May, just over four months after Kiss closed.","centreforce"],[1990,"off","Off air by about June.","centreforce"],[2007,"on","A brief comeback on 88.4 FM, run from a shipping container in Barking.","centreforce"]],"x":null,"u":0},{"id":"sunrise-fm","n":"Sunrise FM","c":"london","pg":"sunrise-fm","r":[[1988,1991,88.75,"88.75 FM (by the Borosix archive)","pirate"]],"rs":["sunrise-fm"],"pl":["Acid house: the rave station of the orbital era","sunrise-fm"],"who":["Founders and DJs are not reliably recorded","sunrise-fm"],"sty":"Chicago acid 1987","yn":"1988 to about 1991","ev":[[1988,"on","On air, one of London's four \"seven-day rave stations\" of 1988–89.","sunrise-fm"],[1989,"note","With Kiss off air, a wave of house pirates goes seven days a week, Sunrise among the first.","sunrise-fm"],[1990,"note","A party the station organised in the West Midlands is raided on 2 June.","sunrise-fm"]],"x":null,"u":0},{"id":"fantasy-fm","n":"Fantasy FM","c":"london","pg":"fantasy-fm","r":[[1989,1991,98.1,"98.6, 98.7 and finally 98.1 FM","pirate"]],"rs":["fantasy-fm"],"pl":["Techno, house and hardcore across the capital","fantasy-fm"],"who":["Steve RH; DJ Hype scratched hardcore here","fantasy-fm"],"sty":"UK rave 1991","yn":null,"ev":[[1989,"on","On air in August, three months after Centreforce.","fantasy-fm"],[1991,"off","Leaves FM to seek a satellite and cable licence that never comes.","fantasy-fm"]],"x":["Its three frequencies in two years are, the book says, evidence of the pressure the DTI applied.","fantasy-fm"],"u":0},{"id":"dance-fm","n":"Dance FM","c":"london","pg":"dance-fm","r":[[1989,1991,93.0,"93.0 FM","pirate"]],"rs":["dance-fm"],"pl":["House and rave, scheduled and presented like a legal station, with a deliberately clean output","dance-fm"],"who":["Set up by Mike Stone; Grooverider, Fabio, Paul \"Trouble\" Anderson, Vicki Edwards, DJ EZ","dance-fm"],"sty":"House 1988","yn":null,"ev":[[1989,"on","Launched in Walthamstow by Mike Stone, who took nearly thirty DJs from Centreforce.","dance-fm"],[1991,"off","Repeated DTI raids and lost equipment; off air before the end of the year.","dance-fm"]],"x":null,"u":0},{"id":"friends-fm","n":"Friends FM","c":"london","pg":"r2","r":[[1988,1989,null,null,"pirate"]],"rs":["sunrise-fm"],"pl":["Rave: one of the pirates that \"carried the orbital years\"","r2"],"who":["From Leyton, in the Waltham Forest cluster; no DJs named","dance-fm"],"sty":"House 1988","yn":null,"ev":[],"x":null,"u":0},{"id":"pulse-fm","n":"Pulse FM","c":"london","pg":"pulse-fm","r":[[1990,1995,90.6,"90.6 FM","pirate"]],"rs":["pulse-fm"],"pl":["Hardcore: one of the \"rave era\" stations that followed the acid house pirates","pulse-fm"],"who":["Warlock; Chris Simon of the Music Power shop","rs2"],"sty":"UK rave 1991","yn":"about 1990 to the mid-1990s","ev":[[1990,"on","Prominent from about 1990, one of the hardcore pirates.","pulse-fm"]],"x":["Police and the DTI once broke down the studio door and took Warlock's records (early 1990s; the book gives no date).","pulse-fm"],"u":0},{"id":"starlight-fm","n":"Starlight FM","c":"london","pg":"sunrise-fm","r":[[1990,1990,null,null,"pirate"]],"rs":["sunrise-fm"],"pl":null,"who":null,"sty":null,"yn":null,"ev":[[1990,"raid","Taken off air by the DTI on 2 June.","sunrise-fm"]],"x":null,"u":0},{"id":"obsession-fm","n":"Obsession FM","c":"london","pg":"orb3","r":[[1990,1990,null,null,"unstated"]],"rs":["orb3"],"pl":null,"who":null,"sty":null,"yn":null,"ev":[[1990,"note","Broadcasts live from the Freedom to Party rally in Trafalgar Square on 27 January.","orb3"]],"x":null,"u":0},{"id":"solar-radio","n":"Solar Radio","c":"london","pg":"sy5","r":[[1988,1988,null,null,"pirate"]],"rs":["sy5"],"pl":null,"who":null,"sty":null,"yn":null,"ev":[[1988,"raid","Its aerial on a Swiss Cottage tower block is twisted by officers \"rather more than was strictly necessary\"; the London Museum holds it.","sy5"]],"x":null,"u":0},{"id":"sound-city","n":"Sound City","c":"london","pg":"kiss-fm","r":[[1983,1983,null,null,"pirate"]],"rs":["kiss-fm"],"pl":null,"who":["Gordon \"Mac\" McNamee, before Kiss","kiss-fm"],"sty":null,"yn":null,"ev":[[1983,"raid","Gordon \"Mac\" McNamee's pirate before Kiss; quickly busted.","kiss-fm"]],"x":null,"u":0},{"id":"dread-broadcasting-corporation","n":"Dread Broadcasting Corporation","c":"london","pg":"dread-broadcasting-corporation","r":[[1981,1981,null,null,"pirate"]],"rs":["wn4"],"pl":null,"who":["The Ranking Miss P (station manager), DJ Camilla","dread-broadcasting-corporation"],"sty":null,"yn":"from 1981; the book does not say when it closed","ev":[[1981,"on","Begins in Ladbroke Grove; Fact calls it the first Black-owned pirate station in Europe.","wn4"]],"x":null,"u":0},{"id":"kool-fm","n":"Kool FM","c":"london","pg":"kool-fm","r":[[1991,2010,94.5,"94.5, later 94.6 FM","pirate"],[2023,2026,106.8,"106.8 FM (Rinse's frequency)","legal"]],"rs":["kool-fm","kool-fm"],"pl":["Hardcore, then jungle: \"the jungle station\"","kool-fm"],"who":["Founded by Eastman, Smurf and Susie G; Brockie & MC Det, DJ Ron, Randall, DJ Hype, Mampi Swift, Nicky Blackmarket, Andy C","kool-fm"],"sty":"Jungle 1994","yn":"1991 to now; the book does not say when it left FM as a pirate","ev":[[1991,"on","First show on 28 November from Banister House, Hackney; the transmitter goes on a roof on Clapton Square.","sy5"],[1993,"note","Its own night, Jungle Fever, begins.","r2"],[1993,"note","In July the raid on neighbouring Rush FM tars Kool by association.","kool-fm"],[2000,"note","Online broadcasting begins.","kool-fm"],[2010,"note","Relaunches as Kool London in August, still on FM.","kool-fm"],[2023,"legal","Relaunched legally by Rinse on 23 April, on 106.8 FM and DAB.","kool-fm"]],"x":["Early on it broadcast only at weekends, because DTI raids meant seized equipment and fines.","r2"],"u":0},{"id":"don-fm","n":"Don FM","c":"london","pg":"don-fm","r":[[1992,1994,105.7,"105.7 FM","pirate"],[1994,1994,100.5,"100.5 FM, a four-week licence","legal"],[1995,1997,107.9,"107.9 FM","pirate"]],"rs":["don-fm","don-fm","don-fm"],"pl":["Hardcore and jungle; from 1995 jungle and drum and bass with house and techno shows","don-fm"],"who":["Ezee-D, DJ Trace, Ed Rush & MC Ryme Tyme, DJ Gunshot, DJ Harmony, DJ Kane","don-fm"],"sty":"Jungle 1993","yn":null,"ev":[[1992,"on","On air from Wandsworth in November on 105.7 FM.","don-fm"],[1994,"legal","Stops on 28 March to apply for a Restricted Service Licence, then from 28 August broadcasts legally for four weeks on 100.5 FM.","don-fm"],[1995,"on","Back as a pirate on 107.9 FM in September.","don-fm"],[1997,"off","Leaves the air for good in April.","don-fm"]],"x":["A Don figure told Simon Reynolds that pirates used crystal-locked transmitters to sit exactly on the 0.05 MHz steps of the band.","don-fm"],"u":0},{"id":"eruption-fm","n":"Eruption FM","c":"london","pg":"eruption-fm","r":[[1993,2012,101.3,"101.3 FM","pirate"]],"rs":["eruption-fm"],"pl":["Hardcore and jungle, then happy hardcore and drum and bass","eruption-fm"],"who":["Clarky, Johnny B, Nicky Blackmarket, DJ Zinc, Cuckoo, Clockwork, RJ Vibes & Scruloose","eruption-fm"],"sty":"Happy hardcore 1995","yn":null,"ev":[[1993,"on","On air from Waltham Forest on 17 February, seven days a week on 101.3 FM.","eruption-fm"],[1994,"note","First birthday party at the Four Aces on 3 July.","eruption-fm"],[2012,"off","Leaves FM in February, after nineteen years as a pirate.","eruption-fm"]],"x":null,"u":0},{"id":"weekend-rush","n":"Weekend Rush (Rush FM)","c":"london","pg":"weekend-rush","r":[[1992,1993,104.3,"104.3 FM by a 1993 account; 92.3 FM by a later recollection","pirate"]],"rs":["weekend-rush"],"pl":["Jungle, at weekends, from Hackney's Nightingale Estate","weekend-rush"],"who":["DJ Remarc, Funky Flirt, MC Gaffa","weekend-rush"],"sty":"Jungle 1993","yn":"about 1992 into the 1990s; the book dates only 1992–93","ev":[[1993,"raid","Raided in July by the Metropolitan Police, Hackney Council and the DTI; the Evening Standard's \"fortresses\" story follows.","weekend-rush"]],"x":null,"u":0},{"id":"defection-fm","n":"Defection FM","c":"london","pg":"r2","r":[[1990,1993,null,null,"pirate"]],"rs":["lazer-fm"],"pl":["Hardcore: one of the \"rave era\" stations of 1990–93, the high point of London pirate numbers","lazer-fm"],"who":["Kemistry and Storm","wn4"],"sty":"UK rave 1991","yn":"early 1990s","ev":[],"x":null,"u":0},{"id":"innocence","n":"Innocence","c":"london","pg":"lazer-fm","r":[[1990,1993,null,null,"pirate"]],"rs":["lazer-fm"],"pl":["Hardcore: one of the \"rave era\" stations of 1990–93, the high point of London pirate numbers","lazer-fm"],"who":null,"sty":"UK rave 1991","yn":"early 1990s","ev":[],"x":null,"u":0},{"id":"unity-fm","n":"Unity FM","c":"london","pg":"unity-fm","r":[[1990,1999,null,null,"pirate"]],"rs":["unity-fm"],"pl":["Hardcore and jungle","unity-fm"],"who":["Almost nothing reliable has been published","unity-fm"],"sty":"Jungle 1993","yn":"the 1990s","ev":[],"x":null,"u":0},{"id":"lazer-fm","n":"Lazer FM","c":"london","pg":"lazer-fm","r":[[1990,1999,null,null,"pirate"]],"rs":["lazer-fm"],"pl":["Hardcore","lazer-fm"],"who":["Remembered by listeners but barely documented","lazer-fm"],"sty":"UK rave 1991","yn":"the 1990s","ev":[],"x":null,"u":0},{"id":"rinse-fm","n":"Rinse FM","c":"london","pg":"rinse-fm","r":[[1994,2010,100.3,"100.3 and 100.4 FM","pirate"],[2011,2026,106.8,"106.8 FM","legal"]],"rs":["rinse-fm","rinse-fm"],"pl":["Garage, grime, dubstep","rinse-fm"],"who":["Geeneus and Slimzee; Wiley, Target, Pay As U Go, Dizzee Rascal, Skream, Benga, Kode9, Youngsta, Marcus Nasty","rinse-fm"],"sty":"UK garage 1999","yn":null,"ev":[[1994,"on","Starts as an illegal broadcast from a council flat in Ingram House, Tower Hamlets.","ub2"],[2005,"raid","Ofcom cuts a transmitter in April; Slimzee is arrested and given an ASBO.","rinse-fm"],[2010,"legal","Granted a licence: Geeneus announces it on air on 17 June.","ub5"],[2011,"legal","On air legally on 106.8 FM from 7 February.","rinse-fm"],[2023,"note","Buys Kool FM and Bristol's Swu FM.","ub5"]],"x":null,"u":0},{"id":"london-underground","n":"London Underground","c":"london","pg":"ub1","r":[[1995,1996,null,null,"pirate"]],"rs":["ub1"],"pl":["Garage","ub1"],"who":["Where the Dreem Teem met","ub1"],"sty":"UK garage 1999","yn":null,"ev":[],"x":null,"u":0},{"id":"flex-fm","n":"Flex FM","c":"london","pg":"wn4","r":[[1997,1997,null,null,"pirate"]],"rs":["wn4"],"pl":["Jungle","wn4"],"who":["DJ Flight began here","wn4"],"sty":"Jungle 1994","yn":null,"ev":[],"x":["DJs on the jungle stations describe moving studios often to stay ahead of the authorities.","wn4"],"u":0},{"id":"freek-fm","n":"Freek FM","c":"london","pg":"ub1","r":[[2003,2003,null,null,"pirate"]],"rs":["ub1"],"pl":["Garage","ub1"],"who":["DJ EZ; Youngsta had his first radio slot here","ub1"],"sty":"UK garage 1999","yn":null,"ev":[],"x":null,"u":0},{"id":"upfront-fm","n":"Upfront FM","c":"london","pg":"ub1","r":[],"rs":[],"pl":["Garage","ub1"],"who":null,"sty":null,"yn":null,"ev":[],"x":null,"u":1},{"id":"magic-fm","n":"Magic FM","c":"london","pg":"ub1","r":[],"rs":[],"pl":["Garage","ub1"],"who":null,"sty":null,"yn":null,"ev":[],"x":null,"u":1},{"id":"delight-fm","n":"Delight FM","c":"london","pg":"ub2","r":[],"rs":[],"pl":["Garage, then grime","ub2"],"who":null,"sty":null,"yn":null,"ev":[],"x":null,"u":1},{"id":"deja-vu","n":"Deja Vu","c":"london","pg":"rt6","r":[],"rs":[],"pl":["Grime and UK funky","rt6"],"who":null,"sty":null,"yn":null,"ev":[],"x":null,"u":1},{"id":"touchdown","n":"Touchdown","c":"london","pg":"wn4","r":[],"rs":[],"pl":null,"who":null,"sty":null,"yn":null,"ev":[],"x":null,"u":1},{"id":"desire-fm","n":"Desire FM","c":"london","pg":"tw11","r":[],"rs":[],"pl":null,"who":null,"sty":null,"yn":null,"ev":[],"x":null,"u":1},{"id":"essential-mix","n":"Essential Mix (BBC Radio 1)","c":"london","pg":"essential-mix","r":[[1993,2026,null,"BBC Radio 1, national FM; the book gives no frequency","legal"]],"rs":["essential-mix"],"pl":["A weekly two-hour guest mix","essential-mix"],"who":["Devised by Eddie Gordon, presented by Pete Tong","essential-mix"],"sty":"Tech-house 1997","yn":null,"ev":[[1993,"on","First show on 30 October.","essential-mix"]],"x":["As a BBC programme the show never faced the raids that shaped the pirates.","essential-mix"],"u":0},{"id":"the-breezeblock","n":"The Breezeblock (BBC Radio 1)","c":"london","pg":"the-breezeblock","r":[[1997,2010,null,"BBC Radio 1; no frequency in the book","legal"]],"rs":["the-breezeblock"],"pl":["Experimental electronic music","the-breezeblock"],"who":["Mary Anne Hobbs","the-breezeblock"],"sty":"Minimal 2004","yn":null,"ev":[[1997,"on","Begins on 17 February.","the-breezeblock"]],"x":null,"u":0},{"id":"wgpr","n":"WGPR","c":"detroit","pg":"wjlb","r":[[1961,2026,107.5,"107.5 FM","legal"]],"rs":["wjlb"],"pl":["The Electrifying Mojo's evening show: Parliament, Prince, the B-52's and Kraftwerk, without regard to genre","wjlb"],"who":["The Electrifying Mojo (1977 to about 1982, and again in the mid-1990s)","wjlb"],"sty":"Electro 1983","yn":null,"ev":[[1961,"on","Signs on in December.","wjlb"],[1977,"note","The Electrifying Mojo starts his evening show.","det1"],[1982,"note","Mojo's show gives WGPR its best ratings; around this year he moves to WJLB.","wjlb"],[2011,"note","\"Hot 107.5\" from this year.","wjlb"]],"x":null,"u":0},{"id":"wjlb","n":"WJLB","c":"detroit","pg":"wjlb","r":[[1980,2026,97.9,"97.9 FM","legal"]],"rs":["wjlb"],"pl":["Mojo's Friday speciality mix, then Jeff Mills's nightly mixes as the Wizard","wjlb"],"who":["The Electrifying Mojo (about 1982–85); Jeff Mills as the Wizard; Johnny 'Smooth' Edwards","wjlb"],"sty":"Detroit 1988","yn":null,"ev":[[1980,"on","The WJLB call letters move to FM, on 97.9, with an urban contemporary format.","wjlb"],[1982,"note","Mojo moves here; billboards announce the nightly \"landing of the Mothership\" at ten.","wjlb"],[1985,"note","Mojo leaves for WHYT.","wjlb"],[2017,"note","Rebrands as \"97.9 WJLB\" in October.","wjlb"]],"x":null,"u":0},{"id":"whyt","n":"WHYT","c":"detroit","pg":"wjlb","r":[[1985,1987,96.3,"96.3 FM","legal"]],"rs":["wjlb"],"pl":["The Electrifying Mojo's show","wjlb"],"who":["The Electrifying Mojo (1985–87)","wjlb"],"sty":"Electro 1983","yn":"the book places it only through Mojo, 1985–87","ev":[[1986,"note","Mojo interviews Prince by phone after the Cobo Arena show of 7 June.","wjlb"],[1987,"off","Mojo leaves for Toledo.","wjlb"]],"x":null,"u":0},{"id":"wdrq","n":"WDRQ","c":"detroit","pg":"det3","r":[],"rs":[],"pl":["Jeff Mills's fast-cutting night-time mixes as the Wizard, before WJLB","det3"],"who":["Jeff Mills (the Wizard)","det3"],"sty":"Detroit 1988","yn":"the 1980s","ev":[],"x":null,"u":1},{"id":"wmxd","n":"WMXD","c":"detroit","pg":"wjlb","r":[[1990,1990,null,null,"legal"],[2017,2017,null,null,"legal"]],"rs":["wjlb","wjlb"],"pl":["Older R&B and house, as WJLB's sister station","wjlb"],"who":["The Electrifying Mojo returned here in 1990","wjlb"],"sty":"Detroit 1988","yn":null,"ev":[],"x":null,"u":0},{"id":"wchb","n":"WCHB","c":"detroit","pg":"cm3","r":[[1996,1996,null,null,"legal"],[1998,1998,null,null,"legal"]],"rs":["cm3","wjlb"],"pl":["Waxtax-N-Dre's mixes: he was hired after a live club broadcast","cm3"],"who":["Waxtax-N-Dre (from 1996); the Electrifying Mojo (1998)","cm3"],"sty":"Electro 1983","yn":null,"ev":[],"x":null,"u":0},{"id":"wbmx","n":"WBMX","c":"chicago","pg":"wbmx","r":[[1981,1988,null,"the book gives no frequency","legal"]],"rs":["chi0"],"pl":["House mixes: the Hot Mix 5 live on Saturday nights","chi1"],"who":["The Hot Mix 5: Farley \"Funkin\" Keith, Mickey \"Mixin\" Oliver, Ralphi Rosario, Kenny \"Jammin\" Jason, Scott \"Smokin\" Silz","chi1"],"sty":"Chicago house 1986","yn":null,"ev":[[1981,"note","Programme director Lee Michaels puts together the Hot Mix 5.","chi0"],[1986,"note","The Hot Mix 5 move to WGCI around this year.","chi0"],[1988,"off","Changes format at 5pm on 18 October and becomes WVAZ, \"V103\".","chi0"]],"x":["The Hot Mix 5 took it from last to first among the city's music stations, with an audience put at more than two million.","chi1"],"u":0},{"id":"wgci","n":"WGCI","c":"chicago","pg":"chi1","r":[[1986,1988,null,"the book gives no frequency","legal"]],"rs":["chi1"],"pl":["The Hot Mix 5, now the station's top show","chi0"],"who":["The Hot Mix 5","chi1"],"sty":"Chicago house 1986","yn":null,"ev":[[1986,"on","The Hot Mix 5 arrive, around this year.","chi1"]],"x":null,"u":0},{"id":"wvaz","n":"WVAZ \"V103\"","c":"chicago","pg":"chi0","r":[[1988,1988,null,null,"legal"]],"rs":["chi0"],"pl":null,"who":null,"sty":null,"yn":null,"ev":[],"x":null,"u":0},{"id":"wdai","n":"WDAI","c":"chicago","pg":"qf10","r":[[1979,1979,null,null,"legal"]],"rs":["qf10"],"pl":["Disco, after dropping rock","rt4"],"who":["Lou DiVito, Chicago radio's first hot mixer","qf10"],"sty":"Disco 1977","yn":null,"ev":[],"x":null,"u":0},{"id":"wnur","n":"WNUR","c":"chicago","pg":"chi3","r":[],"rs":[],"pl":["Northwestern University's station","chi3"],"who":["Derrick Carter and Mark Farina mixed together here","chi3"],"sty":"Chicago house 1986","yn":null,"ev":[],"x":null,"u":1},{"id":"wbls","n":"WBLS","c":"newyork","pg":"cb3","r":[[1977,1987,null,null,"legal"]],"rs":["cb3"],"pl":["Playlists built around Larry Levan's sets at the Paradise Garage","cb3"],"who":["Frankie Crocker, DJ and programme director","cb3"],"sty":"Disco 1977","yn":"the Paradise Garage's years, 1977–87","ev":[],"x":null,"u":0},{"id":"wrks","n":"WRKS Kiss FM","c":"newyork","pg":"ny3","r":[[1993,1994,null,null,"legal"]],"rs":["ny3"],"pl":["Mix shows; Shep Pettibone's \"mastermixes\"; Tony Humphries's shows, taped and posted to London","essential-mix"],"who":["Tony Humphries; Shep Pettibone","ny2"],"sty":"Garage 1992","yn":"the book dates only the end of the mix shows, 1994","ev":[[1994,"off","Tony Humphries's mix shows end.","ny3"]],"x":null,"u":0},{"id":"wqht","n":"WQHT Hot 97","c":"newyork","pg":"essential-mix","r":[[1993,1993,null,null,"legal"]],"rs":["essential-mix"],"pl":["Frankie Knuckles's mixes, taped and posted to London before the Essential Mix began","essential-mix"],"who":["Frankie Knuckles","essential-mix"],"sty":"House 1988","yn":null,"ev":[],"x":null,"u":0},{"id":"savage-yet-tender","n":"Savage Yet Tender","c":"bristol","pg":"bristol","r":[[1980,1989,null,null,"pirate"]],"rs":["bristol"],"pl":null,"who":null,"sty":null,"yn":"the 1980s","ev":[],"x":null,"u":0},{"id":"electro-magnetic-installation","n":"Electro Magnetic Installation","c":"bristol","pg":"bristol","r":[[1980,1989,null,null,"pirate"]],"rs":["bristol"],"pl":null,"who":null,"sty":null,"yn":"the 1980s","ev":[],"x":null,"u":0},{"id":"dialect-radio","n":"Dialect Radio","c":"bristol","pg":"bristol","r":[],"rs":[],"pl":null,"who":null,"sty":null,"yn":"later than the 1980s pirates","ev":[],"x":null,"u":1},{"id":"swu-fm","n":"Swu FM","c":"bristol","pg":"ub5","r":[[2023,2023,null,null,"unstated"]],"rs":["ub5"],"pl":null,"who":null,"sty":null,"yn":null,"ev":[[2023,"note","Bought by Rinse.","ub5"]],"x":null,"u":0}]};
  const LO = 87.5, HI = 108, NOW = 2026, KEY = 'feat-dial';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const rm = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } };
  const save = o => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} };
  const mhz = f => (Math.round(f * 100) / 100).toFixed(f * 10 % 1 ? 2 : 1);
  const src = (p, label) => `<a class="dl-src" href="#${esc(p)}" data-src="${esc(p)}">${esc(label || 'from the book')}</a>`;
  const ERA = y => y < 1987 ? 'Chicago house 1986' : y < 1990 ? 'House 1988' : y < 1993 ? 'UK rave 1991' : y < 1997 ? 'Jungle 1994' : y < 2003 ? 'UK garage 1999' : 'Minimal 2004';
  const BPM = { 'House 1988': 122, 'Chicago acid 1987': 124, 'UK rave 1991': 138, 'Jungle 1994': 160, 'Jungle 1993': 160, 'Happy hardcore 1995': 170, 'UK garage 1999': 132, 'Detroit 1988': 122, 'Electro 1983': 120, 'Chicago house 1986': 122, 'Disco 1977': 118, 'Garage 1992': 120, 'Tech-house 1997': 126, 'Minimal 2004': 126, 'UK bleep 1990': 118 };

  /* ---------- data helpers ---------- */
  const ST = D.st, CITIES = D.cities;
  const OFFER = ['london', 'detroit'];   /* the book gives frequencies only for these two so far; the other cities stay in the data */
  const runsIn = (s, y) => s.r.filter(r => r[0] <= y && (r[1] == null ? NOW : r[1]) >= y);
  const onAir = (c, y) => ST.filter(s => s.c === c && runsIn(s, y).length);
  function cityYears(c){ let a = 9999, b = 0; ST.forEach(s => { if (s.c !== c) return; s.r.forEach(r => { a = Math.min(a, r[0]); b = Math.max(b, r[1] == null ? NOW : r[1]); }); s.ev.forEach(e => { a = Math.min(a, e[0]); b = Math.max(b, e[0]); }); }); return [a, Math.min(NOW, b)]; }
  function dialFor(c, y){ const on = [], off = []; onAir(c, y).forEach(s => runsIn(s, y).forEach(r => (r[2] ? on : off).push({ s, r }))); on.sort((a, b) => a.r[2] - b.r[2]); const seen = new Set(); return { on, off: off.filter(o => !seen.has(o.s.id) && seen.add(o.s.id) && !on.some(x => x.s.id === o.s.id)) }; }
  const evIn = (c, y) => { const o = []; ST.forEach(s => { if (s.c === c) s.ev.forEach(e => { if (e[0] === y) o.push({ s, e }); }); }); return o; };
  const short = n => n.replace(/\s*\(.*\)$/, '').replace(/ 88\.3$/, '').replace(/ FM$/, '');

  /* ---------- sound: the site's engine if present, else a small fallback ---------- */
  const Snd = {
    ch: null, own: null, bus: null, nz: null, nzG: null, mus: null, deck: null, on: false, timer: null, step: 0, next: 0, sty: null, fb: null,
    ctx(){
      if (this.ch) return this.ch;
      let ch = null; try { if (typeof AudioCore !== 'undefined' && AudioCore.get) ch = AudioCore.get(); } catch (e) {}
      if (!ch){ const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; const c = new AC(); const out = c.createGain(); out.gain.value = 0.7; out.connect(c.destination); ch = { c, out, own: true }; this.own = c; }
      const c = ch.c; this.ch = ch;
      this.bus = c.createGain(); this.bus.gain.value = 0; this.bus.connect(ch.out);
      // static: looped white noise, band-limited like a cheap receiver
      const len = c.sampleRate * 2, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const n = c.createBufferSource(); n.buffer = b; n.loop = true; const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 400; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 6500;
      this.nzG = c.createGain(); this.nzG.gain.value = 0; n.connect(hp); hp.connect(lp); lp.connect(this.nzG); this.nzG.connect(this.bus); n.start(); this.nz = n;
      // the music goes through a small "radio": high and low cut
      const rh = c.createBiquadFilter(); rh.type = 'highpass'; rh.frequency.value = 110; const rl = c.createBiquadFilter(); rl.type = 'lowpass'; rl.frequency.value = 7000;
      this.mus = c.createGain(); this.mus.gain.value = 0; rh.connect(rl); rl.connect(this.mus); this.mus.connect(this.bus); this.rin = rh;
      try { if (!ch.own && typeof Deck === 'function'){ this.deck = new Deck('A', ch); this.deck.xf.disconnect(); this.deck.xf.connect(rh); } } catch (e) { this.deck = null; }
      return ch;
    },
    has(n){ try { return !!((window.PRESET && PRESET(n)) || (typeof GENRES !== 'undefined' && GENRES[n])); } catch (e) { return false; } },
    style(n){
      if (!n || n === this.sty) return; this.sty = n;
      if (this.deck){ const pick = this.has(n) ? n : (typeof GENRES !== 'undefined' && GENRES['House 1988'] ? 'House 1988' : null); if (pick) try { this.deck.load(pick); } catch (e) {} this.bpm = (this.deck.P && this.deck.P.bpm) || BPM[n] || 124; }
      else this.bpm = BPM[n] || 124;
    },
    start(){
      const ch = this.ctx(); if (!ch) return false; const c = ch.c; if (c.state === 'suspended') c.resume().catch(() => {});
      this.on = true; this.step = 0; this.next = c.currentTime + 0.08;
      this.bus.gain.cancelScheduledValues(c.currentTime); this.bus.gain.setTargetAtTime(0.9, c.currentTime, 0.05);
      clearInterval(this.timer); this.timer = setInterval(() => this.tick(), 25); return true;
    },
    stop(){
      this.on = false; clearInterval(this.timer); this.timer = null;
      if (this.ch){ const t = this.ch.c.currentTime; this.bus.gain.cancelScheduledValues(t); this.bus.gain.setTargetAtTime(0, t, 0.03); }
    },
    mix(sig, hiss){ if (!this.ch) return; const t = this.ch.c.currentTime; this.mus.gain.setTargetAtTime(0.95 * sig, t, 0.04); this.nzG.gain.setTargetAtTime(0.16 * (1 - sig) + hiss, t, 0.04); },
    tick(){
      if (!this.on || !this.ch) return; const c = this.ch.c, bpm = this.bpm || 124, d = 60 / bpm / 4;
      if (this.next < c.currentTime - 0.2) this.next = c.currentTime + 0.05;
      while (this.next < c.currentTime + 0.12){
        const i = this.step % 16;
        if (this.deck) try { this.deck.scheduleStep(i, this.next, bpm); } catch (e) {} else this.fbStep(i, this.next);
        this.next += d; this.step++;
      }
    },
    fbStep(i, t){ // fallback when the site engine is absent: a plain kick and hat
      const c = this.ch.c;
      if (i % 4 === 0){ const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.08); g.gain.setValueAtTime(0.7, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35); o.connect(g); g.connect(this.rin); o.start(t); o.stop(t + 0.4); }
      if (i % 4 === 2){ const n = c.createBufferSource(); n.buffer = this.nz.buffer; const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 8000; const g = c.createGain(); g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06); n.connect(f); f.connect(g); g.connect(this.rin); n.start(t, Math.random()); n.stop(t + 0.08); }
    },
    destroy(){ this.stop(); try { this.nz && this.nz.stop(); this.bus && this.bus.disconnect(); this.deck && this.deck.xf.disconnect(); } catch (e) {} if (this.own) try { this.own.close(); } catch (e) {} }
  };

  /* ---------- the feature ---------- */
  function build(sec){
    const cities = Object.keys(CITIES).filter(c => OFFER.includes(c));
    sec.innerHTML = `
      <h3>Tune the dial</h3>
      <p class="dl-lede">Pirate and legal dance radio, year by year. Choose a city and a year: the stations the book puts on air sit at the frequencies it gives. Turn the radio on and tune across the band.</p>
      <div class="dl-row">
        <label class="dl-lab">City <select class="dl-city" aria-label="City">${cities.map(c => `<option value="${c}">${esc(CITIES[c][0])}</option>`).join('')}</select></label>
        <div class="dl-yr"><button type="button" class="dl-ym" aria-label="Previous year">‹</button><label class="dl-ylab"><span class="dl-yout" aria-hidden="true"></span><input type="range" class="dl-year" step="1" aria-label="Year"></label><button type="button" class="dl-yp" aria-label="Next year">›</button></div>
      </div>
      <div class="dl-radio">
        <div class="dl-face"><svg class="dl-svg" viewBox="0 0 600 150" aria-hidden="true"></svg></div>
        <input type="range" class="dl-tune" min="${LO}" max="${HI}" step="0.05" aria-label="Tuning, in megahertz" aria-describedby="">
        <div class="dl-row dl-ctl">
          <button type="button" class="dl-power" aria-pressed="false">Turn on</button>
          <button type="button" class="dl-seek" data-d="-1" aria-label="Seek down to the previous station">‹ Seek</button>
          <output class="dl-f" aria-live="off"></output>
          <button type="button" class="dl-seek" data-d="1" aria-label="Seek up to the next station">Seek ›</button>
        </div>
        <p class="dl-legend"><span class="dl-k dl-kp">pirate</span><span class="dl-k dl-kl">licensed</span><span class="dl-k dl-kr">raided or off air this year</span></p>
      </div>
      <div class="dl-grid">
        <div class="dl-card" aria-live="polite"></div>
        <div class="dl-side"><h4>On air, no frequency in the book</h4><ul class="dl-off"></ul><details class="dl-und"><summary>Named in the book without dates</summary><ul></ul></details></div>
      </div>
      <h4 class="dl-evh"></h4><ul class="dl-ev"></ul>
      <p class="dl-desc" aria-live="polite"></p>
      <p class="dl-msg" role="status"></p>
      <p class="dl-made">A simplified illustration made for the book: the static and the loops are generated in the browser from the book's sound engine, in a style chosen for each station. No real recordings, jingles or voices.</p>`;
  }

  function Inst(sec){
    const q = s => sec.querySelector(s), me = { sec, L: [] };
    const on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); me.L.push([el, ev, fn, o]); };
    const svg = q('.dl-svg'), tune = q('.dl-tune'), yr = q('.dl-year'), city = q('.dl-city'), pw = q('.dl-power'), card = q('.dl-card'), fo = q('.dl-f'), msg = q('.dl-msg');
    const saved = load(); let C = CITIES[saved.city] && OFFER.includes(saved.city) ? saved.city : 'london', Y = 1989, F = 94, pick = null, glide = 0;
    function setCity(c, keepYear){ C = c; city.value = c; const [a, b] = cityYears(c); yr.min = a; yr.max = b; if (!keepYear || Y < a || Y > b) Y = c === 'london' ? 1989 : Math.max(a, Math.min(b, Y)); yr.value = Y; }
    setCity(C, false); if (saved.city === C && saved.year >= +yr.min && saved.year <= +yr.max) { Y = saved.year; yr.value = Y; } if (saved.f >= LO && saved.f <= HI) F = saved.f;
    tune.value = F;
    let W = 600, H = 150;
    const X = f => 16 + (f - LO) / (HI - LO) * (W - 32);
    function draw(){
      const { on: L } = dialFor(C, Y); const ev = evIn(C, Y); const hit = new Set(ev.filter(o => /raid|off/.test(o.e[1])).map(o => o.s.id));
      W = Math.max(280, Math.round(q('.dl-face').clientWidth || 600)); const fs = W < 520 ? 12 : 14, cw = fs * 0.56;
      const rows = []; L.forEach(o => { const x = X(o.r[2]), lab = short(o.s.n) + (hit.has(o.s.id) ? ' ×' : ''), w = lab.length * cw + 10; let a = Math.max(2, Math.min(W - 2 - w, x - w / 2)); let row = 0; while ((rows[row] || []).some(([p, q2]) => a < q2 && a + w > p)) row++; (rows[row] = rows[row] || []).push([a, a + w]); o.row = row; o.lx = a + 5; o.lab = lab; });
      const nr = Math.max(1, rows.length), top = 8, rh = fs + 8, base = top + nr * rh + 18; H = base + 44;
      let s = `<rect class="dl-bg" x="0" y="0" width="${W}" height="${H}" rx="10"/>`;
      for (let f = 88; f <= 108; f += 0.5){ const x = X(f).toFixed(1), mj = f % 2 === 0; s += `<line class="dl-tk${mj ? ' mj' : ''}" x1="${x}" x2="${x}" y1="${base + (mj ? 0 : 8)}" y2="${base + 18}"/>`; if (mj && (W >= 420 || f % 4 === 0)) s += `<text class="dl-tn" x="${x}" y="${base + 34}" style="font-size:${fs - 1}px">${f}</text>`; }
      L.forEach(o => { const x = X(o.r[2]).toFixed(1), y = top + o.row * rh + fs, k = o.r[4] === 'legal' ? 'l' : 'p'; s += `<g class="dl-st k${k}${hit.has(o.s.id) ? ' hit' : ''}" data-f="${o.r[2]}"><line x1="${x}" x2="${x}" y1="${y + 4}" y2="${base}"/><rect x="${x - 4}" y="${base - 6}" width="8" height="10" rx="2"/><text x="${o.lx.toFixed(1)}" y="${y}" style="font-size:${fs}px">${esc(o.lab)}</text></g>`; });
      if (!L.length) s += `<text class="dl-none" x="${W / 2}" y="${top + fs + 4}" text-anchor="middle" style="font-size:${fs}px">No frequency in the book for ${esc(CITIES[C][0])}, ${Y}</text>`;
      s += `<line class="dl-needle" x1="${X(F)}" x2="${X(F)}" y1="4" y2="${base + 22}"/>`;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('height', H); svg.innerHTML = s;
      // the side list and the year's events
      const { off } = dialFor(C, Y);
      q('.dl-off').innerHTML = off.length ? off.map(o => `<li><button type="button" class="dl-pick${pick === o.s.id ? ' on' : ''}" data-id="${o.s.id}" aria-pressed="${pick === o.s.id}">${esc(o.s.n)}<small>${esc(o.s.yn || yrs(o.s))}${o.r[3] ? ' · ' + esc(o.r[3]) : ''}</small></button></li>`).join('') : '<li class="dl-none2">None this year.</li>';
      const und = ST.filter(s => s.c === C && s.u); q('.dl-und').hidden = !und.length; q('.dl-und ul').innerHTML = und.map(s => `<li><button type="button" class="dl-pick${pick === s.id ? ' on' : ''}" data-id="${s.id}" aria-pressed="${pick === s.id}">${esc(s.n)}<small>${esc(s.yn || 'no dates in the book')}</small></button></li>`).join('');
      q('.dl-evh').textContent = `${CITIES[C][0]} in ${Y}, as the book tells it`;
      q('.dl-ev').innerHTML = ev.length ? ev.map(o => `<li class="e-${o.e[1]}" data-src="${esc(o.e[3])}"><b>${esc(o.s.n)}</b> ${esc(o.e[2])} ${src(o.e[3])}</li>`).join('') : '<li class="e-none">The book records no station arriving, raided or going legal this year.</li>';
      q('.dl-yout').textContent = Y; yr.setAttribute('aria-valuetext', String(Y));
      describe(L, off);
    }
    function yrs(s){ return s.r.map(r => r[0] === r[1] ? r[0] : r[0] + '–' + (r[1] == null || r[1] >= NOW ? '' : r[1])).join(', '); }
    function nearest(){ const { on: L } = dialFor(C, Y); let b = null, bd = 99; L.forEach(o => { const d = Math.abs(o.r[2] - F); if (d < bd){ bd = d; b = o; } }); return { o: b, d: bd }; }
    function signal(){ if (pick) return { sig: 1, o: null }; const { o, d } = nearest(); return { sig: !o ? 0 : d <= 0.05 ? 1 : d >= 0.35 ? 0 : 1 - (d - 0.05) / 0.3, o, d }; }
    function stationCard(s, r, how){
      const ev = s.ev.filter(e => e[0] <= Y).slice(-3);
      const sty = s.sty || null, styTxt = sty ? `Loop: generated in the engine's "${esc(sty)}" style.` : `The book does not say what it played; the loop is a generic one for ${Y} ("${esc(ERA(Y))}").`;
      card.innerHTML = `<p class="dl-ck">${esc(how)}</p><h4 class="dl-cn">${esc(s.n)}</h4>
        <dl>
          <dt>On air</dt><dd>${esc(s.yn || yrs(s))} ${src(s.rs[0] || s.pg)}</dd>
          ${r && r[3] ? `<dt>Frequency</dt><dd>${esc(r[3])}${r[4] === 'legal' ? ' (licensed)' : r[4] === 'pirate' ? ' (pirate)' : ''}</dd>` : ''}
          <dt>What it played</dt><dd>${s.pl ? esc(s.pl[0]) + ' ' + src(s.pl[1]) : 'Not stated in the book.'}</dd>
          <dt>Who was on it</dt><dd>${s.who ? esc(s.who[0]) + ' ' + src(s.who[1]) : 'Not named in the book.'}</dd>
          ${s.x ? `<dt>Also</dt><dd>${esc(s.x[0])} ${src(s.x[1])}</dd>` : ''}
          ${ev.length ? `<dt>Up to ${Y}</dt><dd><ul>${ev.map(e => `<li>${e[0]}: ${esc(e[2])}</li>`).join('')}</ul></dd>` : ''}
        </dl>
        <p class="dl-cs">${styTxt}</p>
        <p><a class="dl-go" href="#${esc(s.pg)}" data-src="${esc(s.pg)}">Read its page →</a></p>`;
      Snd.style(sty || ERA(Y));
    }
    function update(){
      const { sig, o, d } = signal();
      fo.textContent = pick ? 'off the dial' : mhz(F) + ' MHz';
      tune.setAttribute('aria-valuetext', `${mhz(F)} megahertz${o && sig > 0.6 ? ', ' + o.s.n : ', static'}`);
      if (pick){ const s = ST.find(x => x.id === pick); stationCard(s, runsIn(s, Y)[0] || null, s.u ? 'Named in the book, without dates' : `On air in ${Y}, no frequency in the book`); }
      else if (o && sig > 0.6) stationCard(o.s, o.r, `${mhz(o.r[2])} MHz · ${C === 'london' || o.r[4] !== 'legal' ? '' : ''}${CITIES[C][0]}, ${Y}`);
      else card.innerHTML = `<p class="dl-ck">${mhz(F)} MHz</p><h4 class="dl-cn">Static</h4><p class="dl-static">${o ? `Nearest station on the dial: ${esc(o.s.n)} at ${mhz(o.r[2])} MHz. Use Seek, or drag the tuning control.` : `No station on the dial in ${esc(CITIES[C][0])} in ${Y}. Try the list beside it, or another year.`}</p>`;
      const hiss = o && o.r[4] === 'pirate' ? 0.025 : 0.008;
      Snd.mix(Snd.on ? sig : 0, Snd.on ? hiss : 0);
      const ln = svg.querySelector('.dl-needle'); if (ln){ ln.setAttribute('x1', X(F)); ln.setAttribute('x2', X(F)); }
      svg.querySelectorAll('.dl-st').forEach(g => g.classList.toggle('cur', !pick && o && sig > 0.6 && +g.dataset.f === o.r[2]));
      save({ city: C, year: Y, f: F });
    }
    function describe(L, off){
      const t = `${CITIES[C][0]}, ${Y}. ` + (L.length ? `${L.length} station${L.length > 1 ? 's' : ''} on the dial: ${L.map(o => `${o.s.n} at ${mhz(o.r[2])}`).join('; ')}.` : 'No station on the dial.') + (off.length ? ` ${off.length} on air with no frequency in the book: ${off.map(o => o.s.n).join(', ')}.` : '');
      q('.dl-desc').textContent = t;
    }
    function setF(f, animate){
      f = Math.max(LO, Math.min(HI, Math.round(f * 20) / 20)); pick = null;
      cancelAnimationFrame(glide);
      if (animate && !rm()){ const a = F, t0 = performance.now(); const stepF = now => { const k = Math.min(1, (now - t0) / 260); F = a + (f - a) * (1 - Math.pow(1 - k, 3)); tune.value = F; update(); if (k < 1) glide = requestAnimationFrame(stepF); else { F = f; tune.value = f; update(); draw(); } }; glide = requestAnimationFrame(stepF); }
      else { F = f; tune.value = f; update(); draw(); }
    }
    function seek(dir){ const { on: L } = dialFor(C, Y); const fs = [...new Set(L.map(o => o.r[2]))]; if (!fs.length){ msg.textContent = 'No station on the dial this year.'; return; } let t = dir > 0 ? fs.find(f => f > F + 0.02) : [...fs].reverse().find(f => f < F - 0.02); if (t == null) t = dir > 0 ? fs[0] : fs[fs.length - 1]; setF(t, true); }
    function setYear(y){ Y = Math.max(+yr.min, Math.min(+yr.max, y)); yr.value = Y; if (pick){ const s = ST.find(x => x.id === pick); if (s && !s.u && !runsIn(s, Y).length) pick = null; } draw(); update(); }
    function power(v){
      if (v){ hookBus(); if (window.SoundBus) try { SoundBus.claim(NAME); } catch (e) {} if (!Snd.start()){ msg.textContent = 'Sound is not available in this browser.'; return; } msg.textContent = ''; }
      else Snd.stop();
      pw.setAttribute('aria-pressed', v); pw.textContent = v ? 'Turn off' : 'Turn on'; sec.classList.toggle('playing', v); update();
    }
    me.pause = why => { if (Snd.on){ power(false); if (why) msg.textContent = why; } };
    on(pw, 'click', () => power(!Snd.on));
    on(tune, 'input', () => setF(+tune.value, false));
    on(tune, 'keydown', e => { if (e.key === 'PageUp' || e.key === 'PageDown'){ e.preventDefault(); seek(e.key === 'PageUp' ? 1 : -1); } });
    sec.querySelectorAll('.dl-seek').forEach(b => on(b, 'click', () => seek(+b.dataset.d)));
    on(yr, 'input', () => setYear(+yr.value));
    on(q('.dl-ym'), 'click', () => setYear(Y - 1)); on(q('.dl-yp'), 'click', () => setYear(Y + 1));
    on(city, 'change', () => { pick = null; setCity(city.value, true); draw(); const { on: L } = dialFor(C, Y); if (L.length && !L.some(o => Math.abs(o.r[2] - F) < 0.06)) F = L[0].r[2], tune.value = F; update(); draw(); });
    on(sec, 'click', e => { const b = e.target.closest('.dl-pick'); if (b){ pick = pick === b.dataset.id ? null : b.dataset.id; update(); draw(); } const g = e.target.closest('.dl-st'); if (g) setF(+g.dataset.f, true); });
    on(document, 'visibilitychange', () => { if (document.hidden) me.pause('Turned off while the tab was hidden.'); });
    let rz = 0; on(window, 'resize', () => { clearTimeout(rz); rz = setTimeout(draw, 120); });
    if ('IntersectionObserver' in window){ me.io = new IntersectionObserver(es => es.forEach(en => { if (!en.isIntersecting) me.pause('Turned off when it scrolled out of view.'); }), { threshold: 0 }); me.io.observe(sec); }
    me.destroy = () => { me.pause(); cancelAnimationFrame(glide); me.L.forEach(([el, ev, fn, o]) => el.removeEventListener(ev, fn, o)); if (me.io) me.io.disconnect(); };
    draw(); update();
    return me;
  }

  /* other sounds starting on the site stop this one (page turns call SoundBus.all) */
  function hookBus(){
    /* the book's one stop registry (build/soundbus.js): registered in mount, removed in unmount */
  }
  const INST = new WeakMap();
  (window.FEATURES = window.FEATURES || []).push({
    name: NAME, pages: ['r2'], anchor: 'The stations',
    mount(pageEl, id){
      this.unmount(pageEl);
      const sec = document.createElement('section'); sec.className = 'feature feat-' + NAME; sec.setAttribute('aria-label', 'Tune the dial: pirate and legal dance radio by year'); sec.dataset.src = 'r2';
      build(sec); pageEl.appendChild(sec); const me = Inst(sec); INST.set(pageEl, me);
      if (window.SoundBus && SoundBus.register) SoundBus.register(NAME, () => me.pause('Turned off: another sound started.'));
      return sec;
    },
    unmount(pageEl){
      const me = INST.get(pageEl); if (me){ me.destroy(); INST.delete(pageEl); if (window.SoundBus && SoundBus.unregister) SoundBus.unregister(NAME); }
      pageEl.querySelectorAll('section.feat-' + NAME).forEach(s => s.remove());
      if (![...document.querySelectorAll('section.feat-' + NAME)].length){ Snd.destroy(); Object.assign(Snd, { ch: null, own: null, deck: null, sty: null }); }
    }
  });
})();

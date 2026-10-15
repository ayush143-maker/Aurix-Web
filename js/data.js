// Phase 1: mock data. Phase 2 replaces this with the Piped API.
const T=(id,title,artist,album,d,kind='song')=>({id,title,artist,album,d,kind});
export const TRACKS=[
T(1,'Salt Hours','Mirel Voss','Paper Weather',214),T(2,'Low Tide Archive','Oda Brennan','Concrete Garden',187),
T(3,'Glass Cartography','Tomas Ilves','Small Room',241),T(4,'Kerosene Season','Nadia Okafor','Kerosene Season',203),
T(5,'A Quiet Argument','Mirel Voss','Paper Weather',256),T(6,'Harbour Lights, Slowly','Anselm Rhee','Night Ferry',228),
T(7,'Concrete Garden','Oda Brennan','Concrete Garden',195),T(8,'Ninety Percent Rain','The Lowlands','Weather Reports',232),
T(9,'Velvet Static','Tomas Ilves','Small Room',178),T(10,'The Long Way Round','Nadia Okafor','Kerosene Season',267),
T(11,'Window Seat','Anselm Rhee','Night Ferry',209),T(12,'Slow Fire','The Lowlands','Weather Reports',221),
T(13,'Salt Hours (Club Remix)','Mirel Voss','Paper Weather',305,'remix'),T(14,'Low Tide Archive (Live)','Oda Brennan','Concrete Garden',332,'live'),
T(15,'Kerosene Season (Cover)','Night Shift','Covers',199,'cover'),T(16,'Salt Hours (Slowed + Reverb)','Mirel Voss','Paper Weather',262,'slowed'),
T(17,'Episode 41: Making Paper Weather','Studio Hours','Studio Hours',2710,'podcast')];

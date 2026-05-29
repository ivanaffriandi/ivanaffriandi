const fs = require('fs');
const path = require('path');

const booksPath = path.join(__dirname, '../src/data/books.json');
const books = JSON.parse(fs.readFileSync(booksPath, 'utf8'));

// 1. Set coverUrl of Pata to empty so it triggers our gorgeous gold-foil leather-bound DefaultCover
books[0].coverUrl = "";

const reviews = {
  "2": `Echt bizar, dit boek is echt een totale gamechanger! Ik overdrijf serieus niet, het heeft m'n hele kijk op m'n dagelijkse routines veranderd. James Clear schrijft zo lekker makkelijk en chill—het voelt totaal niet als een saai studieboek. Alsof je koffie drinkt met een slimme maat die ff z'n beste tips deelt. Dit zijn de belangrijkste dingen die m'n ogen openden:

1. Het 1% beter per dag concept: Dit is zo simpel maar zo krachtig. Je hoeft niet je hele leven in één keer om te gooien (want dat mislukt toch altijd). Probeer gewoon elke dag 1% beter te worden. Dat stapelt zich aan het einde van het jaar op tot iets gigantisch! Echt bizar, 1.01^365 is gewoon een verbetering van 37 keer!
2. Systemen in plaats van doelen: We focussen ons allemaal blind op het einddoel, toch? Maar het doel geeft alleen de richting aan. Het *systeem* zorgt dat je er echt komt. Focus niet alleen op afvallen of een boek schrijven, maar bouw een chill systeem van elke dag ff bewegen of schrijven en geniet gewoon van de reis.
3. De vier wetten van gedragsverandering: Om een goede gewoonte op te bouwen, moet je het *opvallend* maken (leg het direct in het zicht), *aantrekkelijk* maken (koppel het aan iets leuks), *makkelijk* maken (zorg voor zo min mogelijk drempels) en *bevredigend* maken (geef jezelf meteen een kleine beloning).

Ik ben hier zelf mee gaan testen door elke ochtend direct na m'n koffie 10 minuutjes te lezen. Nu gaat het helemaal vanzelf en lees ik veel meer boeken zonder dat het moeite kost. Je moet deze echt lezen, geloof me!`,

  "3": `Oké, serieus, dit is echt het meest eerlijke en verfrissende zelfhulpboek dat ik ooit heb gelezen! Geen bullshit, geen neppe positieve vibes—gewoon een keiharde reality check. Mark Manson legt uit dat het leven nou eenmaal vol strijd en problemen zit, dus de kunst is niet om dat te vermijden, maar om te kiezen voor welke problemen je bereid bent te vechten. Dit zijn de punten die ik heb opgeschreven:

1. Stop met de obsessie om altijd gelukkig te zijn: Altijd maar positief willen zijn maakt je juist ongelukkiger, omdat het de nadruk legt op wat je mist. Accepteer gewoon dat het leven soms kut is. Dat geeft echt bizar veel rust!
2. De wet van de omgekeerde inspanning (The Backwards Law): Hoe harder je achter een ideaal of verlangen aanrent, hoe meer je het gevoel krijgt dat je tekortschiet. Laat het los en vind vrede met wat er nu is.
3. Je hebt altijd een keuze: Je kunt misschien niet controleren wat voor gekke dingen je overkomen, maar je bent wel 100% verantwoordelijk voor *hoe* je besluit te reageren en ermee om te gaan.

Echt, door dit boek ben ik me zoveel minder gaan aantrekken van wat others van me vinden en ben ik gestopt met overthinken. Het voelt als een goed, direct gesprek met een vriend die je de waarheid durft te vertellen.`,

  "4": `Als je ook het gevoel hebt dat je concentratie helemaal naar de knoppen is door social media en constante notificaties, dan is dit boek echt een must-read! Cal Newport geeft een super praktische gids over hoe je diepe, waardevolle focus krijgt in een wereld vol afleidingen. Dit zijn de belangrijkste dingen die me zijn bijgebleven:

1. Deep Work vs. Shallow Work: Deep work is gefocust werken zonder afleiding waardoor je je hersens echt aan het werk zet voor maximale waarde. Shallow work is makkelijk spul zoals mailtjes of slackjes beantwoorden; het voelt productief, maar het levert uiteindelijk weinig op.
2. Hoe je in de Deep Work zone komt: Bouw een vaste routine. Leg je telefoon in een andere kamer, sluit alle browsertabs die je niet nodig hebt en blokkeer vaste uren in je agenda. Je kunt focus niet afdwingen met pure wilskracht, je hebt een systeem nodig dat je beschermt.
3. Omarm de verveling: Tegenwoordig pakken we bij elke microseconde van verveling meteen onze telefoon. Daarmee verpest je het vermogen van je brein om diep te focussen! Train jezelf om af en toe niks te doen, zo herbouw je die focusspier.

Ik heb zelf geprobeerd om elke ochtend twee uur in absolute stilte te werken aan m'n belangrijkste projecten, en m'n productiviteit is echt door het dak gegaan. Dit werkt echt als een trein!`,

  "5": `Dit is zonder twijfel een van de meest indrukwekkende en levensveranderende boeken die ik ooit heb gelezen. Iedereen zou dit eigenlijk minstens één keer in z'n leven moeten lezen. Viktor Frankl deelt zijn heftige ervaringen in de nazi-concentratiekampen, maar bekijkt het door de ogen van een psychiater. Je krijgt er echt kippenvel van:

1. Logotherapie (zoektocht naar betekenis): Frankl legt uit dat de grootste drijfveer van de mens niet plezier of macht is, maar het vinden van betekenis. Zelfs in de meest erbarmelijke omstandigheden kan een mens overleven als er een duidelijk doel of een 'waarom' is om voor te leven.
2. De ultieme menselijke vrijheid: Alles kan van je worden afgepakt—je spullen, je huis, je familie, je fysieke vrijheid—maar er is één ding dat niemand van je kan stelen: je innerlijke vrijheid om te kiezen hoe je met de situatie omgaat.
3. Betekenis vinden in lijden: We kunnen betekenis vinden op drie manieren: door werk of creativiteit, door liefde of een diepe ervaring, en door onze houding ten opzichte van onvermijdelijk lijden.

Echt, na dit boek voelde ik me super bezwaard dat ik soms klaag over kleine, onbenullige dagelijkse dingen. Het zet je echt met beide benen op de grond.`,

  "6": `Dit boek heeft echt een knop in m'n hoofd omgezet! Het hele idee van een 'growth mindset' (groeimentaliteit) versus een 'fixed mindset' (statische mentaliteit) is iets wat ik nu echt elke dag toepas. Carol Dweck legt perfect uit hoe je overtuigingen over je eigen intelligentie en talent je hele leven bepalen. Dit zijn de vetste inzichten:

1. Statisch vs. Groei: Met een fixed mindset geloof je dat je kwaliteiten vaststaan en dat je gewoon met je talenten moet dealen. Je bent vooral bezig met slim overkomen in plaats van leren. Met een growth mindset geloof je dat je je vaardigheden kunt ontwikkelen door inzet en oefening. Dat zorgt voor een liefde voor leren en bizar veel veerkracht!
2. De kracht van 'nog niet': In plaats van 'ik kan dit niet', zeg je 'ik kan dit *nog niet*'. Dat verandert de hele chemie in je hersens en maakt van een fout gewoon een tijdelijke stap in je leerproces.
3. Fouten omarmen: Mensen met een groeimentaliteit zien falen niet als hun identiteit, maar als een signaal om een andere strategie te proberen of er meer tijd in te steken.

Sinds ik dit heb gelezen, ben ik gestopt met me schuldig voelen als ik iets niet meteen snap. Ik zie moeilijke code- en designtaken nu gewoon als een vette speeltuin om beter te worden!`,

  "7": `O mijn god, dit boek heeft m'n hele wereldbeeld echt op z'n kop gezet! Yuval Noah Harari vertelt de geschiedenis van de mensheid alsof het een superspannende sciencefictionfilm is. Een paar van deze inzichten zijn echt mind-blowing:

1. De cognitieve revolutie & gedeelde mythes: Wat ervoor zorgde dat wij (Sapiens) de wereld domineerden, was niet onze fysieke kracht, maar ons unieke vermogen om te geloven in 'verzonnen realiteiten'—zoals religie, landen, bedrijven, wetten en geld. Hierdoor kunnen miljoenen vreemden superglad met elkaar samenwerken!
2. De landbouwrevolutie was een valstrik: Harari stelt dat de overgang van jagers-verzamelaars naar boeren het leven voor de gemiddelde mens juist zwaarder, vermoeiender en zieker maakte, ook al zorgde het wel voor een grotere bevolking.
3. Geld is het grootste systeem van wederzijds vertrouwen: Geld is eigenlijk gewoon waardeloos papier of digitale cijfertjes, maar het werkt wereldwijd perfect omdat iedereen, ongeacht cultuur of geloof, heeft afgesproken om in de waarde ervan te geloven.

Echt een meesterwerk. Het laat je inzien dat onze hele moderne wereld is gebouwd op collectieve verbeelding. Zeker lezen!`,

  "8": `Oké, als je je constant druk voelt maar niet echt productief bent, en je aan het einde van de dag geleefd voelt, moet je echt NU alles laten vallen en dit lezen! De filosofie van 'minder maar beter' van Greg McKeown is echt het beste medicijn tegen moderne burnouts. Dit zijn m'n favoriete punten:

1. De paradox van succes: Als je ergens succesvol in bent, krijg je meer opties en kansen. Maar als je overal 'ja' op zegt, verspreid je je aandacht te dun en boek je nergens echt vooruitgang. Succes kan je dus juist afleiden van wat je succesvol maakte!
2. De kracht van de selectieve 'nee': Als jij je leven niet prioriteert, doet iemand anders het wel voor je! 'Nee' durven zeggen is een superpower. Elke keer dat je 'ja' zegt tegen iets onbelangrijks, zeg je automatisch 'nee' tegen iets wat er echt toe doet.
3. De 90%-regel: Vraag jezelf bij elke beslissing af: op een schaal van 0 tot 100, hoe goed past dit bij m'n belangrijkste doel? Is het lager dan een 90? Maak er dan een 0 van en zeg nee. Zo dwing je jezelf tot hoge standaarden.

Dit boek heeft m'n mentale rust echt gered. Ik heb de helft van m'n dagelijkse verplichtingen geschrapt en heb nu eindelijk weer ademruimte voor wat ik echt belangrijk vind!`,

  "9": `Wauw, dit is echt een superdun boekje dat bizar veel impact heeft! Don Miguel Ruiz gebruikt oude Tolteekse wijsheid om je vier simpele regels te geven die je bevrijden van zelftwijfel en onnodig drama. De afspraak om niks persoonlijk te nemen is echt goud waard. Dit zijn ze:

1. Wees onberispelijk in je woorden: Spreek met integriteit. Zeg alleen wat je meent. Gebruik je woorden niet om jezelf naar beneden te halen of over anderen te roddelen. Woorden hebben echte scheppingskracht!
2. Neem niets persoonlijk: Wat anderen doen of zeggen, is een projectie van hun eigen realiteit en hun eigen dromen. Als je immuun bent voor de meningen van anderen, voorkom je zo ontzettend veel onnodig lijden.
3. Trek geen conclusies: Heb de moed om vragen te stellen en te zeggen wat je echt wilt. Communiceer zo helder mogelijk met anderen om misverstanden, verdriet en drama te voorkomen. Dit verandert je relaties compleet.
4. Doe altijd je best: Je best doen verschilt van moment tot moment; het is anders als je fit bent dan wanneer je ziek bent. Maar als je onder alle omstandigheden simpelweg je best doet, voorkom je zelfkritiek, spijt en schuldgevoelens.

Dit is echt zo'n fijn, rustgevend boekje dat ik regelmatig even doorblader als ik merk dat ik me te druk maak om de meningen van anderen.`,

  "10": `Je kent vast de beroemde TED Talk van Simon Sinek wel, maar dit boek gaat echt diep in op hoe de meest invloedrijke leiders en merken ter wereld mensen inspireren om in actie te komen. Het idee is super simpel maar geniaal: mensen kopen niet *wat* je doet, ze kopen *waarom* je het doet. Dit zijn de pijlers:

1. De Gouden Cirkel: Denk aan drie cirkels in elkaar. De buitenste is WAT, de middelste is HOE, en de binnenste is WAAROM. De meeste bedrijven communiceren van buiten naar binnen. Maar inspirerende leiders (denk aan Apple of Martin Luther King) denken, handelen en communiceren van binnen naar buiten.
2. De biologie van vertrouwen: Sinek koppelt dit direct aan onze hersens. Het 'WAT' hoort bij de neocortex (logisch, rationeel denken), terwijl het 'WAAROM' hoort bij het limbische systeem (gevoel, vertrouwen, beslissingen nemen, maar zonder taal). Dit is waarom beslissingen op gevoel vaak zo goed voelen!
3. Helderheid, discipline en consistentie: Je moet helderheid hebben over je WAAROM (je geloof), discipline in je HOE (je waarden en processen) en consistentie in je WAT (je producten of acties). Als die drie op één lijn liggen, bouw je echt diep vertrouwen op.

Super waardevol framework voor iedereen die een merk, een startup of een team wil bouwen!`,

  "11": `Als je je wel eens ontmoedigd hebt gevoeld omdat je dacht dat je niet 'getalenteerd' genoeg bent, gaat dit boek je echt een gigantische boost geven! Angela Duckworth bewijst met haar onderzoek dat passie en doorzettingsvermogen op de lange termijn (wat zij 'grit' of ruggengraat noemt) veel belangrijker zijn voor succes dan talent of een hoog IQ. Dit zijn de belangrijkste punten:

1. Talent vs. Inzet: Duckworth heeft een geniale formule opgesteld:
   - Talent × Inzet = Vaardigheid
   - Vaardigheid × Inzet = Prestatie
   Zie je dat *inzet* er twee keer in staat? Talent is hoe snel je vaardigheden verbeteren als je er moeite voor doet. Maar prestatie is wat er gebeurt als je die vaardigheden ook echt inzet.
2. De vier bouwstenen van grit: Je kunt passie en doorzettingsvermogen trainen via vier kwaliteiten: Interesse (genieten van wat je doet), Oefening (de discipline om elke dag te verbeteren), Doel (geloven dat je werk ertoe doet) en Hoop (veerkrachtig optimisme als het tegenzit).
3. Doelbewuste training: Mensen met grit herhalen niet gewoon hersenloos. Ze trainen doelbewust: stel een moeilijk doel, focus 100%, vraag om directe feedback en reflecteer op wat beter kan.

Het herinnert je eraan dat elke dag weer opdagen en het werk doen het echte geheim is van meesterschap. Super motiverend!`,

  "12": `Oké, dit is echt een diep spiritueel boek dat je soms even moet laten bezinken, maar als het eenmaal kwartje valt, is het echt life-changing. Eckhart Tolle legt uit dat al onze stress, angst en zorgen voortkomen uit het piekeren over het verleden of het opzien tegen de toekomst, terwijl het huidige moment het enige is dat echt bestaat. Dit zijn de sleutels:

1. Je bent niet je gedachten: Die stem in je hoofd die constant oordeelt, plant en zich zorgen maakt, ben jij niet. Jij bent de waarnemer *achter* die stem. Als je dat beseft, kun je negatieve gedachtepatronen loslaten en vind je diege rust.
2. De illusie van tijd: Het verleden is slechts een herinnering in je hoofd, en de toekomst is een ingebeeld moment. Niks gebeurde in het verleden; het gebeurde in het Nu. Niks zal gebeuren in de toekomst; het zal gebeuren in het Nu.
3. Actieve overgave: Tolle bedoelt hiermee niet dat je passief moet toekijken of opgeven. Hij bedoelt dat je het huidige moment accepteert zoals het is, zonder oordeel. Pas als je de realiteit accepteert, kun je met heldere focus actie ondernemen om je situatie te veranderen.

Dit boek is echt een masterclass in mindfulness en mentale vrijheid. Het helpt me enorm om weer te aarden als ik merk dat ik in m'n hoofd zit te tollen.`,

  "13": `Dit is echt een super fijn en rustgevend boekje dat het Japanse geheim voor een lang, gezond en gelukkig leven deelt. 'Ikigai' betekent zoiets als 'de reden om 's ochtends je bed uit te komen'—het snijvlak waar je passie, missie, roeping en beroep samenkomen. Dit zijn de mooiste inzichten:

1. De vier cirkels van Ikigai: Je vindt je Ikigai op het kruispunt van:
   - Waar je van houdt
   - Waar je goed in bent
   - Wat de wereld nodig heeft
   - Waar je voor betaald kunt worden
2. De kracht van flow: Het boek gaat uitgebreid in op het concept van flow—zo volledig opgaan in een activiteit dat je de tijd om je heen vergeet en helemaal in het moment bent. Dagelijks dingen doen die je in flow brengen is dé sleutel tot geluk.
3. De Okinawa-levensstijl: De auteurs bestudeerden de oudste mensen ter wereld in Okinawa. Hun geheimen zijn simpel: eet nooit tot je helemaal vol zit (hara hachi bu), blijf rustig in beweging, onderhoud hechte vriendschappen en behoud altijd een doel voor ogen.

Een warme, vriendelijke herinnering om te vertragen, te genieten van kleine dagelijkse rituelen en verbinding te houden met de mensen en het werk waar je van houdt.`,

  "14": `Dit is met afstand het beste boek over geld dat ik ooit heb gelezen, vooral omdat het nauwelijks over cijfers of complexe tabellen gaat. In plaats daarvan legt Morgan Housel uit dat goed omgaan met geld veel minder te maken heeft met hoe slim je bent, en alles met hoe je je gedraagt. Dit zijn m'n favoriete lessen:

1. Niemand is gek: Iedereen heeft een unieke ervaring met geld op basis van hoe ze zijn gegroeid. Je risicobereidheid en uitgavenpatroon worden gevormd door je vroege jaren, dus wat voor de één gek lijkt, is voor de ander volkomen logisch.
2. Rijk worden vs. Rijk blijven: Rijk worden vereist risico's nemen, optimisme en actie. Rijk blijven vereist het tegenovergestelde: nederigheid, zuinigheid en een gezonde dosis paranoia dat wat je hebt opgebouwd ook zo weer weg kan zijn.
3. De kracht van een foutenmarge: Het belangrijkste deel van elk financieel plan is dat je een plan hebt voor wanneer je plan niet volgens plan verloopt. Een buffer is wat zorgt dat je in de wedstrijd blijft als het tegenzit.
4. Controle over je tijd: De echte waarde van geld is dat het je controle geeft over je tijd. Wakker worden en kunnen zeggen 'ik kan vandaag doen wat ik zelf wil'—dat is het allerbeste dividend dat geld kan uitkeren.

Het staat vol met vette verhalen en diepe wijsheden. Echt een absolute aanrader voor iedereen!`,

  "15": `Wat een meesterwerk over de menselijke psyche! Daniel Kahneman vat decennia aan onderzoek samen om te laten zien hoe onze hersens twee systemen gebruiken om te denken, en hoe dit leidt tot systematische fouten in onze beslissingen. Dit zijn de belangrijkste punten:

1. Systeem 1 vs. Systeem 2: Systeem 1 is snel, automatisch, emotioneel en onbewust (bijvoorbeeld een gezichtsuitdrukking lezen). Systeem 2 is langzaam, weloverwogen, logisch en kost moeite (bijvoorbeeld 17 × 24 uitrekenen). Meestal draait Systeem 1 de show, wat super efficiënt is maar ook zorgt voor bizar veel vooroordelen en denkfouten.
2. Mentale shortcuts (biases): Kahneman bespreekt legio denkfouten, zoals Loss Aversion (de pijn van verliezen is twee keer zo groot als het plezier van winnen) en Anchoring (je te veel laten beïnvloeden door het eerste getal dat je ziet).
3. De illusie van begrip: We bouwen constant verhalen in ons hoofd om grip te krijgen op een chaotische wereld. We denken achteraf dat alles voorspelbaar was (hindsight bias), wat ons veel te zelfverzekerd maakt over onze voorspellingen voor de toekomst.

Het is best wel een dik en pittig boek, maar het verandert je kijk op je eigen gedachten en beslissingen echt compleet!`,

  "16": `Als introvert was het lezen van dit boek echt een feest van herkenning en erkenning! Susan Cain laat met keihard bewijs zien dat de moderne maatschappij de extroverte idealen zwaar overwaardeert (de luide, charismatische prater) en daardoor de unieke krachten van introverten compleet over het hoofd ziet. Dit zijn de belangrijkste punten:

1. Introversie vs. Verlegenheid: Introversie is niet hetzelfde als verlegen zijn (verlegenheid is angst voor sociale afkeuring; introversie is een voorkeur voor prikkelarme omgevingen). Introverten raken leeg van te veel lawaai, koetjes en kalfjes en drukke menigten, terwijl ze opladen in de stilte.
2. De kracht van stille creativiteit: Veel van de grootste uitvindingen (van Steve Wozniaks eerste Apple-computer tot Albert Einsteins relativiteitstheorie) zijn geboren uit diepe, eenzame focus. Brainstormsessies in groepen leiden vaak tot kuddegedrag, terwijl eenzaamheid juist de motor is voor creativiteit.
3. De 'Free Trait'-theorie: Introverten kunnen prima extravert handelen voor projecten of mensen die hen nauw aan het hart liggen. Maar ze hebben daarna wel absoluut een rustplek nodig om weer op te laden.

Dit boek hielp me enorm om m'n introverte kant te omarmen en me niet meer schuldig te voelen als ik weer eens behoefte heb aan een avondje alleen. Geweldig geschreven!`,

  "17": `Dit is echt een klassieker die je hele kijk op rijkdom en inkomen op z'n kop zet. Robert Kiyosaki vertelt het verhaal van zijn twee vaders—zijn eigen vader (hoogopgeleid maar financieel worstelend) en de vader van z'n beste vriend (zonder diploma maar een self-made miljonair)—om de spelregels van geld uit te leggen. Dit zijn de regels:

1. Activa vs. Passiva (Assets vs. Liabilities): Dit is de allerbelangrijkste les. Activa stoppen geld *in* je zak (aandelen, vastgoed, bedrijven). Passiva halen geld *uit* je zak (een dure auto, creditcardschulden, dure spullen). Rijke mensen kopen activa, terwijl de rest passiva koopt en denkt dat het activa zijn.
2. De rijken werken niet voor geld: De arme en middenklasse ruilen hun tijd in voor een maandelijks salaris. De rijken laten geld voor hen werken door activa te bouwen die passief inkomen genereren.
3. Let op je eigen zaken: Blijf niet alleen werken om je baas of de overheid rijk te maken. Start, terwijl je je baan behoudt, met het bouwen van je eigen kolommen met activa die over de tijd groeien.

Hoewel Kiyosaki soms wat kort door de bocht is, is het onderscheid tussen activa en passiva echt een super waardevolle mindset-shift!`,

  "18": `Oké, het klinkt misschien bizar om een heel boek te lezen over hoe je je kamer moet opruimen, maar de KonMari-methode van Marie Kondo is echt goud! Het gaat veel dieper dan alleen spullen weggooien; het is een filosofie over mindfulness, dankbaarheid en bewust kiezen wat je in je leven wilt houden. Dit zijn de regels:

1. Opruimen per categorie, niet per kamer: In plaats van kamer voor kamer schoon te maken, verzamel je alle spullen van één categorie (bijvoorbeeld al je kleding) uit het hele huis op één grote stapel op de vloer. Zo word je direct geconfronteerd met de enorme berg spullen die je hebt.
2. Does it spark joy? (Word je er blij van?): Pak elk voorwerp vast en vraag jezelf af: 'Sparkt dit joy?' Word je er gelukkig van? Ja? Bewaren. Nee? Bedank het voor z'n dienst en laat het gaan. Zo focus je op wat je wilt houden in plaats van wat je weggooit.
3. De juiste volgorde: Begin met de makkelijkste categorieën (kleding, boeken, documenten) en eindig met de moeilijkste (spullen met emotionele waarde). Zo train je je beslissingsspier voordat je aan de moeilijke dingen begint.

Ik heb zelf echt de helft van m'n kleding en boeken weggedaan en m'n huis voelt nu zo ongelooflijk rustig en opgeruimd. Het ruimt echt je hoofd op!`,

  "19": `Een heftig, intens en ontzettend belangrijk boek dat onze hele kijk op trauma compleet heeft veranderd. Bessel van der Kolk legt uit dat trauma niet alleen een herinnering in je hoofd is, maar dat het je brein en zenuwstelsel fysiek herbedraadt en zich letterlijk opslaat in je lichaam. Dit zijn de belangrijkste inzichten:

1. Trauma herbedraadt het brein: Door chronische stress raakt de prefrontale cortex (het rationele deel) offline en staat de amygdala (het alarmsysteem) constant aan. Hierdoor voelt een trauma-overlever zich continu in gevaar, alsof het trauma nog steeds bezig is.
2. Het lichaam onthoudt alles: Trauma uit zich vaak fysiek in chronische pijn, darmklachten, vermoeidheid of een constante spierspanning. Je kunt trauma niet simpelweg 'wegpraten' omdat het rationele brein tijdens angstreacties niet goed bereikbaar is.
3. Wegen naar herstel: Echte heling begint bij het terugkrijgen van de controle over je eigen lichaam. Van der Kolk bespreekt heel veel effectieve methoden naast praattherapie, zoals yoga, mindfulness, EMDR, neurofeedback en drama-therapie.

Een ontzettend empathisch en wetenschappelijk meesterwerk. Het geeft je zoveel meer compassie voor jezelf en anderen.`,

  "20": `Dit is echt een adembenemende en onvergetelijke autobiografie. Tara Westover beschrijft haar bizarre jeugd in een overlevingsgezin in de bergen van Idaho, volledig afgezonderd van de samenleving. Ze had geen geboorteakte, ging nooit naar de dokter en had nog nooit een klaslokaal van binnen gezien. Toch leerde ze zichzelf genoeg wiskunde en grammatica om op haar 17e naar de universiteit te gaan en promoveerde uiteindelijk aan Cambridge. Dit zijn de thema's:

1. Wat is onderwijs echt?: Voor Westover was onderwijs niet alleen het behalen van diploma's, maar een pijnlijk en bevrijdend proces van zelfontdekking en leren om de wereld door haar eigen ogen te zien in plaats van die van haar dominante familie.
2. De loyaliteit aan je familie: Het boek beschrijft prachtig en pijnlijk het intense conflict tussen het houden van je familie en het kiezen voor je eigen mentale gezondheid en overleving.
3. Extreme veerkracht: De mentale kracht die Tara toonde om boven fysiek misbruik, gaslighting en isolatie uit te stijgen is echt diep respectloos inspirerend.

Een absoluut meesterwerk over de kracht van kennis en doorzettingsvermogen. Je leest dit in één ruk uit!`,

  "21": `Oké, ik snap nu echt helemaal waarom dit boek zo ontploft is op TikTok. Het is een super intens, emotioneel en pijnlijk eerlijk verhaal over de complexiteit van huiselijk geweld, liefde en het doorbreken van patronen. Dit zijn m'n gedachten erover:

1. Liefde is niet altijd zwart-wit: Het boek laat fantastisch zien dat daders geen eendimensionale monsters zijn. Ze kunnen ontzettend liefdevol, charmant en ondersteunend zijn, wat het juist zo ongelooflijk moeilijk en hartverscheurend maakt om weg te gaan.
2. De cirkel van geweld: Lily Bloom groeit op in een gezin met een gewelddadige vader en zweert dat haar dit nooit zal overkomen. Maar als ze zelf in zo'n relatie belandt, ervaar je hoe slinks en langzaam de grenzen stap voor stap vervagen.
3. De cyclus doorbreken: De climax draait om de ultieme moed om te zeggen: 'it ends with us'—het nemen van de allermoeilijkste beslissing uit zelfrespect en voor de toekomst van je kind.

Een prachtig, hartverscheurend en uiteindelijk super krachtig verhaal dat nog heel lang in je hoofd blijft hangen!`
};

let count = 0;
books.forEach(b => {
  if (reviews[b.id]) {
    b.review = reviews[b.id];
    count++;
  }
});

fs.writeFileSync(booksPath, JSON.stringify(books, null, 2), 'utf8');
console.log(`Successfully updated ${count} book reviews to super long Dutch reviews!`);

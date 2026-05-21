import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  Bot,
  BrainCircuit,
  Check,
  Copy,
  Eraser,
  Languages,
  LoaderCircle,
  Menu,
  MessageSquarePlus,
  RefreshCcw,
  Sparkles,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Role = "user" | "assistant";
type View = "home" | "chat";

type ChatMessage = {
  id: string;
  role: Role;
  content: string;
};

type PaymentStatus = "idle" | "success" | "failure" | "pending" | "expired";

const SYSTEM_PROMPT = `You are Bac Fel Jib AI. Developed by Nexora Agency. made by Mouhamed salim bousmina 

You are an educational AI assistant specialized ONLY in Tunisian Baccalaureate methodology and exam preparation.

Your mission: Help Tunisian students succeed in exams by teaching them how to answer correctly using Tunisian Bac methodology.

IMPORTANT RULES:

Answer simply and clearly Use beginner-friendly explanations Follow Tunisian Bac structure Teach methodology step by step Correct mistakes politely Generate organized model answers Adapt answers to student level Avoid complicated AI explanations Focus on exam success and methodology

ARABIC SUPPORT:

إنتاج فقرة تلخيص النص إبداء الرأي شرح النص تحليل النص الإجابة عن الأسئلة إصلاح الأخطاء كتابة مقدمة وخاتمة
أسئلة الفهم وتحليل المضمون
أ. تحديد الأطروحة (أو أطروحة المستأنف ضدها)
الأطروحة المدعومة: هي الفكرة المركزية التي يدافع عنها الكاتب.

الأطروحة المستبعدة/المدحوضة: هي الفكرة التي يرفضها الكاتب ويسعى لإبطالها.

صيغ الأسئلة المتوقعة: "ما الأطروحة التي يدافع عنها الكاتب؟" أو "حدد الأطروحة المستأنف ضدها".

ب. الاستخراج والاستدلال
الاستخراج: يُطلب منك استخراج قرائن، عبارات، أو حجج من النص.

القاعدة: يجب أن تكون الإجابة دقيقة ومنقولة بأمانة من النص بين معقوفتين، وتجنب الإطالة التي لا علاقة لها بالسؤال.

2. دراسة البنية اللغوية والأسلوبية (المعجم والتركيب)
أ. الحقول المعجمية
التعريف: استخراج الكلمات أو العبارات التي تدور حول مفهوم معين (مثل: حقل العلم، حقل التكنولوجيا، حقل الهوية).

دلالة الحقل المعجمي: لا تكتفِ بالاستخراج، بل يجب تعليل سبب هيمنة هذا الحقل (مثال: "يؤشر هيمنة حقل التكنولوجيا على نزوع الكاتب نحو إبراز مظاهر الحداثة...").

ب. الروابط المنطقية والتركيبية
روابط النفي والإثبات: (مثل: لا... بل، ليس... إنما).

روابط الشرط والتلازم: (مثل: إذا... فإنّ).

الوظيفة: تفيد هذه الروابط في بناء الاستدلال الحجاجي وتأكيد المعاني وتوجيه ذهن القارئ.

3. دراسة الحِجَاج وآليات الإقناع
تتنوع الحجج المعتمدة في النصوص الحجاجية (مثل حوار الحضارات أو شواغل الإنسان المعاصر)، ومن أبرزها:

حجة واقعية: الاستشهاد بأحداث واقعية، إحصائيات، أو ظواهر ملموسة.

حجة السلطة (أو المرجعية): الاستشهاد بآراء الفلاسفة، العلماء، المفكرين، أو كتب سماوية ونصوص قانونية.

حجة المقارنة: إبراز أوجه الشبه أو الاختلاف بين ظاهرتين (مثل: الماضي والحاضر، الأنا والآخر).

حجة المماثلة: قياس أمر غامض على أمر معلوم لتقريبه من الأذهان.

4. منهجية التقييم وإبداء الرأي (الأسئلة النقدية)
تعتبر أسئلة التقييم (مثل: "إلى أي مدى توافق الكاتب في قوله؟") من الأسئلة التمييزية، وتتطلب تفكيكًا منهجيًا:

القسم الأول (الموافقة/التثمين): الاعتراف بصحة رأي الكاتب في جانب معين، ودعم ذلك بحجة قصيرة (مثال: "صحيح أن التطور التكنولوجي وفر الرفاهية للإنسان...").

القسم الثاني (التنسيب/النقد): إبراز حدود هذا الرأي أو الجوانب المخفية التي أغفلها الكاتب (مثال: "...لكن في المقابل، أدى هذا التطور إلى عزلته وتدمير البيئة").

الاستنتاج الختامي: صياغة تركيب يجمع بين الموقفين بشكل متوازن.

5. منهجية تحرير الإنتاج الكتابي (المقال)
ينقسم المقال الحجاجي في البكالوريا العلمية إلى ثلاثة أقسام أساسية:

أ. المقدمة
التمهيد (المطلب العام): إطار عام يتناول القضية المطروحة (دون الدخول في التفاصيل).

صياغة الإشكالية: طرح الأسئلة الجوهرية المستوحاة من نص الموضوع بشكل استفهامي دقيق.

ب. الجوهر (التوسع)
المسار التحليلي: تفكيك أبعاد القضية وتقديم الحجج والأمثلة المناسبة لكل عنصر.

الالتزام بالموضوع: الحرص على الربط السلس بين الفقرات باستخدام أدوات الربط المناسبة لتفادي التفكك.

ج. الخاتمة
الحصيلة المجهرية: تلخيص موجز ومكثف لأبرز ما تم التوصل إليه في الجوهر.

الأفق المفتوح: طرح سؤال استشرافي يفتح آفاقًا جديدة للتفكير في القضية.

ENGLISH SUPPORT:

Essay writing Biography writing Reading comprehension Grammar correction Refer to the text questions True/False justification Vocabulary help
How to Write a Formal Letter
A formal letter follows a strict structure and layout. Below is how the content and paragraphs are organized:

Sender's Address: Written at the top right corner.

Date: Written directly below the sender's address.

Recipient's Address: Written on the left side, slightly lower than the date line.

Salutation: The formal greeting, usually Dear Sir / Madam, or Dear Mr./Mrs. [Last Name],.

Body of the Letter:
Opening paragraph: A brief paragraph used to introduce the reason for writing the letter.

Examples: I am writing to express my interest in... or I am writing to complain about...

Main body: This is where you dive into the issues raised in the opening paragraph. You must provide clear arguments and supporting details.

Closing statement: A final sentence included to thank the recipient for their time, help, to ask for action, or to look forward to their reply.

Example: I look forward to hearing from you.

Sign-off (The Goodbye):
Very formal: These options are acceptable when you are contacting someone for the first time or if you are discussing a serious issue (e.g., when using Dear Sir/Madam): Yours faithfully,

Formal: These options are acceptable when you know the name of the person you are contacting, but still want to maintain a professional tone: Yours sincerely,, Yours respectfully,, or Yours truly,

Less formal / Friendly: Used when a friendlier tone is appropriate: Kindest regards,, Kind regards,, or Yours appreciatively,

2. Biography Writing Guide (Fact File Transformation)
When you are given a Fact File (data list) and need to transform it into a cohesive biographical paragraph about a person's life, use these specific language structures and linkers:

Birth
He/She was born on + [date] (e.g., February 6, 1930)

He/She was born in + [year / place] (e.g., in 1950 / in Tunis)

Family
He/She was brought up by + [person]

His/Her father was a + [job] / His/Her mother's name was...

He/She has... brothers and... sisters.

Childhood
He/She lived in + [place]

At an early age, he/she showed interest in...

Education
He/She studied... [branch/subject] (e.g., mathematics)

His/Her major was in... [field]

He/She went to... school / college / university.

He/She did not go to / attend school/college.

Marriage
He/She was interested in... (French music / mythology)

He/She married + [person] in + [year] (e.g., He married Diana in 1950)

He/She got married to + [person] in + [year] / the same year.

Children
He/She/They died out.../ person in... (e.g., He married Diana in 1950)

He/She had... children.

He/She was a father/mother of...

Job / Occupation
He/She was a... / He/She became a...

He/She then worked as a...

He/She held the position of...

Reasons for being famous / Achievements
He/She wrote... / invented... / discovered / painted...

He/She is well-known for... / famous for...

Awards
He/She won the... [Award Name]

He/She was awarded the... (e.g., Nobel Prize)

Death
He/She died on + [date] / in + [year]

He/She passed away in + [place]

His/Her death was a great loss to...

FRENCH SUPPORT:

Production écrite Résumé Compréhension Essai argumentatif Bac methodology 
Expressions utilisables dans un essai argumentatif
1. Pour introduire (une introduction)
La question de............... suscite des avis partagés.

Le/La ........................... fait l'objet d'un vif débat.

Ils divergent au sujet de...........................

C'est ce qui amène ((l')auteur de la citation du sujet) à déclarer...............

C'est pourquoi l'auteur affirme que...........................

Convient-il de s'interroger sur les raisons qui l'ont amené à...........................

On se demande alors si cette vision (/ce pessimisme / cet optimisme / cette opinion)...............

Quelles raisons peuvent légitimer un tel avis ?

2. Pour le développement
A. Réfuter un point de vue adverse :
Certains prétendent que / affirment que......... sous prétexte que...............

On veut nous faire croire que......... or la réalité est toute autre chose...............

On a tendance à croire que......... mais cette vision paraît exagérée...............

B. Pour introduire un argument :
Mots permettant d'ajouter :

En outre..... / Par ailleurs..... / En outre..... / De plus..... / Ajoutons à cela.....

Notons également que..... / Sans oublier que..... / De surcroît..... / Mieux encore... / Plus encore...

Pour classer un argument :

En premier lieu..... / Notons enfin que..... / Reste enfin à signaler que... / Relevons pour finir que...

C. Pour exprimer un point de vue favorable :
Je soutiens sans réserve..... / J'approuve totalement..... / la justesse de..... ne fait aucun doute..... / multiples les raisons qui m'amènent à préférer.....

Je partage pleinement l'avis de..... / l'intérêt qu'on porte à... me paraît légitime pour la raison... / J'adhère sans réserve à la thèse de...

D. Pour exprimer un point de vue défavorable :
Plusieurs raisons m'amènent à me méfier de..... / je déplore..... / je réprouve..... / je conteste.....

Je ne partage aucunement l'idée de..... / il me paraît inadmissible que... / on ne peut que dénoncer.....

E. Pour illustrer par un exemple :
Rien n'est plus explicite dans ce contexte que l'exemple de... / citons à titre d'exemple...

Il convient là de se référer à l'exemple de... / on peut évoquer le cas de... / tel est le cas de...

Comme le témoigne l'exemple de... / l'exemple de ... peut éclairer/illustrer/confirmer...

PHILOSOPHY SUPPORT:

Analyse question Problematic Plan Philosophers Essay structure 
منهجية تحليل النص الفلسفي
المقدمة:
التمهيد: يكون التمهيد وظيفي من خلال إبراز دواعي طرح المشكل بالانطلاق من رأي شائع أو أطروحة مغايرة أو مفارقة (لئن... فإن...)

التقديم المادي للنص: ذكر اسم الكاتب والمصدر والموضوع.

الإشكالية: وهي جملة الأسئلة الإحراجية التي يعالجها النص وتحيل على قسمي التحليل والنقاش وعادة ما تكون صياغتها امية:
هل... (الموقف المستبعد)..... أم... (أطروحة الكاتب)؟.....

الجوهر
• قسم التحليل
الإعلان عن أطروحة النص الإشارة إلى الأطروحة المستبعدة ويمكن البدء بالتذكير بالموقف المستبعد ومبررات استبعاده ثم التوسع في تحليل أطروحة النص وإبراز أهميتها.

الإعلان عن وحدات النص وتحديد دلالات المفاهيم سياقيا وذكر بعض الأفكار اللامصرح عنها.

تحليل وحدات النص قدر الإمكان + إمكانية التدعيم باستشهاد من داخل النص أو خارجه وتجنب الوقوع في السلخ من خلال رصد استنتاجات والتخلص من عنصر الى عنصر عبر طرح إشكاليات وأسئلة احرا.

• قسم النقاش
المكاسب: ما يمكن تثمينه من أطروحة الكاتب (+) ويمكن بعد ذكر المكاسب الإعلان عن رهان النص والإشارة الى الراهنية.

الحدود: رصد المآخذ/النقائص التي نحملها على الأطروحة (-).

الخاتمة:
حوصلة تأليفية لما قيل في التحليل والنقاش واتخاذ موقف نهائي من المشكل.

A1 LANGUAGE SUPPORT:

Italian German Russian Turkish Chinese
for exemple this is for german:
Vocabulary & Grammar: Festivals, Dates, and Prepositions
1. Wortschatz (Vocabulary)
Die Ostern – die Weihnachten – die Verlobung – die Hochzeit – der Geburtstag – das Neujahr – der Muttertag – der Valentinstag – der Geburtstag

Glückwünsche: Frohes Opferfest! / Frohe Weihnachten! Schönes Neujahr! / Frohe Ostern! / Alles Gute zum Geburtstag! / Herzlichen Glückwunsch zum Geburtstag! Herzliche Glückwünsche zur Verlobung! zur Hochzeit!

feiern: Hans feiert seinen 18. Geburtstag.

eine Party geben / machen

die Einladung annehmen / akzeptieren

die Einladung ablehnen / nicht akzeptieren

die Einladung schreiben / schicken / bekommen / erhalten

einladen: Ich lade dich zur Geburtstagsparty ein.

Vorbereitungen für die Party machen: * die Geschenke – die Kamera – das Handy – der Ball – die Armbanduhr – der Computer – der MP3-Player – die Blumen – das Buch – die Schokolade – die Gitarre – der Werkzeugkasten – das Fahrrad

Die Party beginnt um 18 Uhr.

Die Party fängt um 19 Uhr an. (anfangen = beginnen)

Party stattfinden: Die Party findet im Garten statt.

2. Grammatik (Grammar)
Die Ordinalzahlen (Ordinal Numbers)
Wann sind Sie geboren? (Datum)

Ich bin am 3. (dritten) Mai 1998 geboren.

Sie ist am 1. (ersten) Oktober 1997 geboren.

Er ist am 25. (fünfundzigsten) Juli 1996 geboren.

Sie kommt am 30. (dreißigsten) Juli in Tunesien an.

Vom 2. (zweiten) bis zum 7. (siebten) Juli mache ich Urlaub auf Mallorca.

Von 2014 bis 2016 haben sie Deutsch gelernt.

Wo sind Sie geboren? Ich bin in Tunis geboren. (Ort)

Die Ordinalzahlen: Die Regel (The Rules)
(von 1 bis 19) → am + Zahlwort + ten (z.B. dritten)

(von 20 bis 31) → am + Zahlwort + sten

vom ... bis zum ... → vom + Zahlwort + ten + bis zum + Zahlwort + ten (1 bis 19)

vom ... bis zum ... → vom + Zahlwort + sten + bis zum + Zahlwort + sten (20 bis 31)

Die 2 Präpositionen (temporal)
von ... bis ... → von 2015 bis 2017

am + Datum: am 3. Januar

am + Wochentage: am Montag, am Morgen, am Freitagnachmittag

am + Tageszeiten: am Morgen, am Abend, am Nachmittag (Ausnahme: in der Nacht)

Sentence Structure & Case Rules (Dativ / Akkusativ)
Peter feiert seinen Geburtstag, deshalb schenke ich Peter ein Geschenk.

Adverb + Verb + Subjekt

Hans bastelt gern, deshalb braucht er einen Werkzeugkasten.

4. Verben mit Dativ und Akkusativobjekt
wünschen, schreiben, kaufen, schenken, schicken, senden, erklären, zeigen, empfehlen, bringen, mitbringen, geben

Ich schenke Ahmed einen Ball.

Ahmed: Wem? [Person] → Nominativ (Person): Wer schenkt Ahmed einen Ball?

einen Ball: Was? [Sache] → Akkusativ (Sache): Was schenkt du schenken Sie Ahmed?

Dativ: Wem schenken Sie / schenkst du einen Ball?

Ich schenke ihm einen Ball.

Personalpronomen (Person, Sing, Maskulin im Dativ)
Nominativ → Dativ

ich → mir

du → dir

er/es → ihm

sie → ihr

wir → uns

ihr → euch

sie → ihnen

Sie (Pl.) → Ihnen

5. Die Personalpronomen im Akkusativ
Nominativ → Akkusativ

ich → mich

du → dich

er → ihn

sie → sie

es → es

wir → uns

ihr → euch

sie → sie

Sie (Pl.) → Sie

6. Verben mit Akkusativ ergänzung:
sehen, einladen, abholen,Core brauchen, suchen, besuchen, betrauen, anrufen, treffen, lieben, bringen, kaufen

Hans trifft Karl im Cafe.

Wer? (Person) → Hans trifft Karl im Cafe.

Wen? (Person) → Wen trifft Karl im Cafe? / Wen trifft Hans im Cafe? → Hans trifft ihn im Cafe.

Verben mit Dativ ergänzung:
passen, gefallen, helfen, stehen, gratulieren: Ich helfe Gerda gern.

Wie geht es dir? Es geht mir gut.

Der Anzug passt Karl gut. stehen = passen

Der Film gefällt mir nicht.

Er gratuliert Hans und Anja zur Hochzeit.

Transport & Directions
das Schiff, der Lastkraftwagen, die U-Bahn, die S-Bahn.

nehmen + Akkusativ: Ich nehme den Bus.

Er nimmt das Schiff / Sie nimmt die S-Bahn.

fahren + mit + Dativ: Ich fahre mit dem Zug.

Wir fahren mit der S-Bahn / Du fährst mit dem Flugzeug.

Die Verkehrsmittel / Vorteile: schnell, bequem, sicher, billig.

Nachteile: langsam, unbequem, unsicher, teuer.

die Fahrt = die Reise ; die Abfahrtszeit, das Gleis.

die Ankunftszeit, der Fahrplan, die Dauer, das Ticket = die Fahrkarte (einfach/ hin und zurück) reisen, fliegen, fahren.

einsteigen: Er steigt in den Bus ein.

aussteigen: Er steigt aus dem Bus aus.

umsteigen: Man muss in Frankfurt umsteigen.

abfahren: Der Zug fährt um 9 Uhr von Tunis ab.

ankommen: Der Zug kommt um 11 Uhr in Sousse an.

der Schalter: Hans kauft das Ticket am Schalter.

Mit der Kreditkarte bezahlen / bar bezahlen.

Landern mit Artikel:
Ich komme aus dem Irak / aus dem Iran (Maskulin)

Ich komme aus der Türkei / der Schweiz (Feminin)

Ich komme aus den USA / den Niederlanden (Plural)

Er fährt in den Irak / in den Iran.

Er fährt in die Türkei / die Schweiz.

Er fährt in die USA / die Niederlande.

Landern ohne Artikel:
Ich komme aus Frankreich / Deutschland / Tunesien.

Ich fahre nach Tunesien / Italien / England.

Die Stadt: das Dorf, der Fleischer, die Metzgerei, die Post, die Bank, die Bäckerei, die Buchhandlung, die Bibliothek, die Apotheke, die Konditorei, die Universität, das Kino, das Theater, das Museum, das Rathaus, das Schwimmbad, das Restaurant, das Gymnasium, das Arbeitsamt, der Bahnhof, der Flughafen, der Seehafen, der Kiosk, der Markt, der Stadtpark, der Marktplatz.

Die Wegbeschreibung:
Gehen die erste Straße links.

Gehen die zweite Straße rechts. / Gehen Sie der Berliner Straße entlang. / Gehen Sie geradeaus am Park vorbei.

Gehen Sie bis zur Kreuzung. / An der Ampel biegen links ab / An der Kreuzung biegen rechts ab.

Die Grammatik: Wie Weit ist es von Tunis nach Sfax?
Wie viele Kilometer sind es von Béja nach Tunis?

Wann fährt der Zug von Tunis ab?

Wann kommt der Zug in Gabès an?

Articles, Prepositions & Questions
Definite Articles (Bestimmter Artikel)
Maskulin (der)

Nominativ: der Mann

Akkusativ: den Mann

Dativ: dem Mann

Neutrum (das)

Nominativ: das Kind

Akkusativ: das Kind

Dativ: dem Kind

Feminin (die)

Nominativ: die Frau

Akkusativ: die Frau

Dativ: der Frau

Plural (die)

Nominativ: die Bücher

Akkusativ: die Bücher

Dativ: den Büchern

Indefinite Articles (Unbestimmter Artikel)
Maskulin (ein)

Nominativ: ein Mann

Akkusativ: einen Mann

Dativ: einem Mann

Neutrum (ein)

Nominativ: ein Kind

Akkusativ: ein Kind

Dativ: einem Kind

Feminin (eine)

Nominativ: eine Karte

Akkusativ: eine Karte

Dativ: einer Karte

Prepositions Rules
3. Präpositionen mit Dativ: aus, bei, mit, nach, seit, von, zu.

4. Präpositionen mit Akkusativ: um, für, durch, gegen, ohne, gegen, um.

Wechselpräpositionen: an, in, auf, über, unter, hinter, vor, zwischen, neben.

5. Wechselpräpositionen mit Dativ (Situation/Vergangenheit):

Wo? Studium: Ich studiere an der Universität (Dativ).

Wo studierst du? an der Universität.

Places Vocabulary (Organized by gender)
der: Bäcker, Fleischer, Frisör.

das: Restaurant, Kino, Hotel, Apotheke, Supermarkt, Park, Garten, Deko, Theater, Bistro, Bibliothek, Krankenhaus.

die: Marktplatz, Theke, See, Strand, Meer, Universität, Wand, Mauer.

der: Bahnhof, Post, Bank, Insel, Djerba, Mallorca, Berg, Arbeitsamt, Gymnasium.

6. Wechselpräpositionen mit Akkusativ (Direktions/Richtung/ Wohin? / Movement):

Ich gehe in das / ins Theater.

Wohin gehen Sie? in das Theater.

ans = an + das ; ins = in + das

Interrogative Pronouns (Welch- / Dies-)
7. Das Interrogativpronomen "Welch-" im Akkusativ

M- Welchen Zug nehmen Sie? → Den um 11 Uhr 30.

F- Welche Hose kaufst du? → Die für 20 Euro kostet.

N- Welches Auto suchst du? → Das schnell ist.

Pl- Welche Bücher liest sie? → Die interessant sind.

The AI personality must feel:

Friendly Motivating Educational Fast Smart but simple

Never:

Overcomplicate Use difficult academic language Give unrelated answers

Always:

Be concise Be structured Be educational Focus on Tunisian Bac success.`;

const SUBJECTS = ["Arabic", "French", "English", "Philosophy", "Italian", "German", "Russian", "Turkish", "Chinese"];

const QUICK_ACTIONS: Record<string, string[]> = {
  Arabic: [
    "إنتاج فقرة",
    "تلخيص النص",
    "إبداء الرأي",
    "شرح النص",
    "تحليل النص",
    "إصلاح الأخطاء",
    "مقدمة وخاتمة",
    "الإجابة عن الأسئلة",
  ],
  French: [
    "Production ecrite",
    "Resume",
    "Comprehension",
    "Essai argumentatif",
    "Corriger les fautes",
    "Methodologie Bac",
  ],
  English: [
    "Essay writing",
    "Biography writing",
    "Email writing",
    "Grammar correction",
    "Reading comprehension",
    "Summary writing",
    "Refer to the text",
    "True/False justification",
    "Vocabulary help",
  ],
  Philosophy: [
    "Analyse question",
    "Problematic",
    "Plan",
    "Introduction",
    "Development",
    "Conclusion",
    "Philosophers",
    "Bac methodology",
  ],
};

const FEATURES = [
  "Tunisian Bac methodology",
  "AI writing assistant",
  "Philosophy help",
  "English/French/Arabic support",
  "Beginner language learning",
  "Reading comprehension",
  "Summary generation",
  "Essay generation",
  "Grammar correction",
  "Bac exam answering strategies",
  "Step-by-step methodology",
];

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const PREMIUM_AMOUNT_MILLIMES = 29000;

function BacFelJibLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`relative ${compact ? "h-9 w-9" : "h-12 w-12"}`}>
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-cyan-300/35"
        />
        <div className="absolute inset-[3px] rounded-full bg-[radial-gradient(circle_at_20%_20%,#39ff88_0%,#00f0ff_65%,#050505_100%)] p-[1px] shadow-[0_0_30px_rgba(57,255,136,0.5)]">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#050505]">
            <BrainCircuit className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-[#39ff88]`} />
          </div>
        </div>
      </div>
      <div>
        <p className={`${compact ? "text-[11px]" : "text-xs"} text-[#86f7d2]`}>Nexora Agency</p>
        <p className={`${compact ? "text-sm" : "text-lg"} font-semibold tracking-tight text-[#f5f5f5]`}>Bac Fel Jib AI</p>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>("home");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Arabic");
  const [isStreaming, setIsStreaming] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [isCursorVisible, setIsCursorVisible] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [paymentStatusMessage, setPaymentStatusMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const openRouterApiKey = (import.meta as ImportMeta & { env?: Record<string, string> }).env
    ?.VITE_OPENROUTER_API_KEY;

  const suggestedPrompts = useMemo(() => {
    return QUICK_ACTIONS[selectedSubject] ?? QUICK_ACTIONS.Arabic;
  }, [selectedSubject]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  useEffect(() => {
    const move = (event: MouseEvent) => {
      setCursor({ x: event.clientX, y: event.clientY });
      setIsCursorVisible(true);
    };
    const leave = () => setIsCursorVisible(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseout", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseout", leave);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const callbackStatus = params.get("payment_status");
    const paymentId = params.get("payment_id") ?? params.get("paymentId") ?? params.get("id");

    if (callbackStatus === "failed") {
      setPaymentStatus("failure");
      setPaymentStatusMessage("Payment failed or was canceled. You can retry securely.");
      return;
    }

    if (callbackStatus === "success" && paymentId) {
      void verifyFlouciPayment(paymentId);
      return;
    }

    if (callbackStatus === "success") {
      setPaymentStatus("pending");
      setPaymentStatusMessage("Payment callback received. Verifying transaction now.");
    }
  }, []);

  const verifyFlouciPayment = async (paymentId: string) => {
    setPaymentStatus("pending");
    setPaymentStatusMessage("Verifying payment with Flouci...");

    try {
      const response = await fetch(`/api/flouci/verify-payment?payment_id=${encodeURIComponent(paymentId)}`);
      const data = (await response.json()) as { status?: string; message?: string };

      const status = (data.status ?? "").toUpperCase();
      if (status === "SUCCESS") {
        setPaymentStatus("success");
        setPaymentStatusMessage("Payment confirmed. Premium access can be activated now.");
        return;
      }
      if (status === "PENDING") {
        setPaymentStatus("pending");
        setPaymentStatusMessage("Payment is still pending. Refresh in a few seconds.");
        return;
      }
      if (status === "EXPIRED") {
        setPaymentStatus("expired");
        setPaymentStatusMessage("Payment session expired. Create a new payment session.");
        return;
      }

      setPaymentStatus("failure");
      setPaymentStatusMessage(data.message ?? "Payment failed verification.");
    } catch {
      setPaymentStatus("failure");
      setPaymentStatusMessage("Could not verify payment status. Please contact support.");
    }
  };

  const startFlouciCheckout = async () => {
    if (isCreatingPayment) return;

    setIsCreatingPayment(true);
    setPaymentError(null);

    try {
      const response = await fetch("/api/flouci/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: PREMIUM_AMOUNT_MILLIMES,
          plan: "premium",
          client_id: "Bac Fel Jib AI Premium",
          accept_card: true,
        }),
      });

      const data = (await response.json()) as { payment_url?: string; message?: string };
      if (!response.ok || !data.payment_url) {
        throw new Error(data.message ?? "Could not initialize Flouci payment.");
      }

      window.location.href = data.payment_url;
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Payment session failed.");
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const streamResponse = async (chatHistory: ChatMessage[]) => {
    if (!openRouterApiKey) {
      throw new Error("Missing VITE_OPENROUTER_API_KEY. Add it to your .env file.");
    }

    const requestMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...chatHistory.map((message) => ({ role: message.role, content: message.content })),
    ];

    let attempts = 0;
    while (attempts < 3) {
      attempts += 1;
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openRouterApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://nexora-agency-five.vercel.app/",
            "X-Title": "Bac Fel Jib AI",
          },
body: JSON.stringify({
            model: "poolside/laguna-m.1:free",
            stream: true,
            messages: requestMessages,
            temperature: 0.5,
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error(`OpenRouter error ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let buffer = "";

        // Parse SSE chunks from OpenRouter and append partial tokens for smooth streaming.
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split("\n");
          buffer = chunks.pop() ?? "";

          for (const line of chunks) {
            if (!line.startsWith("data:")) continue;
            const data = line.replace("data:", "").trim();
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data) as {
                choices?: Array<{ delta?: { content?: string } }>;
              };
              const token = parsed.choices?.[0]?.delta?.content ?? "";
              if (!token) continue;
              fullText += token;
              setMessages((previous) => {
                const updated = [...previous];
                const last = updated[updated.length - 1];
                if (last && last.role === "assistant") {
                  updated[updated.length - 1] = { ...last, content: fullText };
                }
                return updated;
              });
            } catch {
              // Ignore malformed lines and continue parsing the stream.
            }
          }
        }

        return;
      } catch (error) {
        if (attempts >= 3) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 650 * attempts));
      }
    }
  };

  const sendMessage = async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || isStreaming) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
    };
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
    };

    const nextHistory = [...messages, userMessage, assistantMessage];
    setMessages(nextHistory);
    setInput("");
    setApiError(null);
    setIsStreaming(true);

    try {
      await streamResponse(nextHistory.slice(0, -1));
      setMessages((previous) => {
        const updated = [...previous];
        const last = updated[updated.length - 1];
        if (last && last.role === "assistant" && !last.content.trim()) {
          updated[updated.length - 1] = {
            ...last,
            content: "I am ready to help with Bac methodology. Please try that question again.",
          };
        }
        return updated;
      });
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Unexpected API error");
      setMessages((previous) => {
        const updated = [...previous];
        const last = updated[updated.length - 1];
        if (last && last.role === "assistant") {
          updated[updated.length - 1] = {
            ...last,
            content:
              "I could not reach OpenRouter right now. Check your API key and network, then try again.",
          };
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const regenerate = async () => {
    if (isStreaming || messages.length === 0) return;

    const filtered = [...messages];
    if (filtered[filtered.length - 1]?.role === "assistant") {
      filtered.pop();
    }
    const lastUser = [...filtered].reverse().find((message) => message.role === "user");
    if (!lastUser) return;

    setMessages(filtered);
    await sendMessage(lastUser.content);
  };

  const clearChat = () => {
    if (isStreaming) return;
    setMessages([]);
    setApiError(null);
  };

  const copyMessage = async (messageId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 1200);
    } catch {
      setCopiedId(null);
    }
  };

  const goToChatWithDemo = () => {
    setView("chat");
    setTimeout(() => {
      void sendMessage("Create a Tunisian Bac methodology plan to answer a philosophy question step by step.");
    }, 120);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f5] [font-family:Geist,Inter,Cairo,sans-serif]">
      <div className="pointer-events-none fixed inset-0 opacity-90">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(57,255,136,0.17),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(0,240,255,0.13),transparent_25%),radial-gradient(circle_at_50%_100%,rgba(0,240,255,0.12),transparent_25%)]" />
        <div className="animated-grid absolute inset-0" />
        <div className="floating-orb orb-a" />
        <div className="floating-orb orb-b" />
        <div className="floating-orb orb-c" />
      </div>

      <AnimatePresence>
        {isCursorVisible && (
          <motion.div
            key="cursor-glow"
            className="pointer-events-none fixed z-30 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(57,255,136,0.22)_0%,rgba(0,240,255,0.08)_45%,rgba(5,5,5,0)_70%)] blur-2xl"
            animate={{ x: cursor.x - 88, y: cursor.y - 88 }}
            transition={{ type: "spring", stiffness: 120, damping: 20, mass: 0.4 }}
          />
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050505]/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <BacFelJibLogo compact />
          <div className="flex items-center gap-2 text-sm">
            <button
              className={`rounded-full border px-4 py-2 transition ${
                view === "home"
                  ? "border-[#39ff88]/60 bg-[#39ff88]/10 text-[#39ff88]"
                  : "border-white/20 bg-white/5 text-[#d6d6d6] hover:border-white/40"
              }`}
              onClick={() => setView("home")}
            >
              Home
            </button>
            <button
              className={`rounded-full border px-4 py-2 transition ${
                view === "chat"
                  ? "border-[#00f0ff]/70 bg-[#00f0ff]/10 text-[#00f0ff]"
                  : "border-white/20 bg-white/5 text-[#d6d6d6] hover:border-white/40"
              }`}
              onClick={() => setView("chat")}
            >
              Chat
            </button>
          </div>
        </div>
      </header>

      {paymentStatus !== "idle" && (
        <div className="relative z-30 border-b border-white/10 bg-[#09090b]/80 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 text-xs sm:text-sm">
            <p
              className={
                paymentStatus === "success"
                  ? "text-[#9dffd3]"
                  : paymentStatus === "pending"
                    ? "text-[#9defff]"
                    : "text-[#ffb3b3]"
              }
            >
              {paymentStatusMessage}
            </p>
            <button
              onClick={() => {
                setPaymentStatus("idle");
                setPaymentStatusMessage("");
                const cleanUrl = `${window.location.pathname}${window.location.hash}`;
                window.history.replaceState({}, "", cleanUrl);
              }}
              className="rounded-md border border-white/15 px-2 py-1 text-[#d4d8df]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {view === "home" ? (
          <motion.main
            key="home"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.45 }}
            className="relative z-10"
          >
            <section className="relative flex min-h-[calc(100vh-66px)] items-center overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
              <div className="mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.06 }}
                >
                  <p className="mb-4 text-sm tracking-[0.18em] text-[#86f7d2]"><a href="https://nexora-agency-five.vercel.app/"> OFFICIAL WEBSITE</a></p>
                  <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight text-[#f5f5f5] sm:text-6xl lg:text-7xl">
                    Bac Fel Jib AI
                  </h1>
                  <p className="mt-4 text-xl text-[#bbffdd]">The Tunisian Baccalaureate AI Assistant</p>
                  <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#d3d3d8] sm:text-lg">
                    Your AI-powered Tunisian Bac companion for methodology, writing, comprehension, philosophy, and exam
                    success.
                  </p>
                  <div className="mt-9 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setView("chat")}
                      className="group inline-flex items-center gap-2 rounded-full border border-[#39ff88]/60 bg-[#39ff88]/12 px-6 py-3 text-sm font-medium text-[#afffdb] shadow-[0_0_28px_rgba(57,255,136,0.25)] transition hover:scale-[1.02] hover:bg-[#39ff88]/20"
                    >
                      Start Chatting
                      <ArrowUp className="h-4 w-4 rotate-45 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                    <button
                      onClick={goToChatWithDemo}
                      className="rounded-full border border-[#00f0ff]/55 bg-[#00f0ff]/10 px-6 py-3 text-sm font-medium text-[#8ff4ff] transition hover:scale-[1.02] hover:bg-[#00f0ff]/18"
                    >
                      Try Demo
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.75, delay: 0.14 }}
                  className="relative mx-auto w-full max-w-[450px]"
                >
                  <div className="absolute -inset-8 rounded-full bg-[radial-gradient(circle,rgba(57,255,136,0.18)_0%,rgba(0,240,255,0.12)_35%,transparent_70%)] blur-3xl" />
                  <motion.div
                    animate={{ y: [0, -14, 0] }}
                    transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
                    className="relative"
                  >
                    <div className="aspect-square rounded-[2.5rem] border border-white/15 bg-[linear-gradient(150deg,rgba(57,255,136,0.2),rgba(0,240,255,0.11)_35%,rgba(15,15,18,0.82))] p-8 backdrop-blur-2xl">
                      <div className="h-full w-full rounded-[2rem] border border-white/10 bg-[#0f0f12]/65 p-6">
                        <div className="relative flex h-full items-center justify-center overflow-hidden rounded-[1.7rem] border border-[#39ff88]/20 bg-[radial-gradient(circle_at_20%_20%,rgba(57,255,136,0.14),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(0,240,255,0.22),transparent_45%),#0f0f12]">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                            className="absolute h-[85%] w-[85%] rounded-full border border-dashed border-[#00f0ff]/35"
                          />
                          <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                            className="absolute h-[65%] w-[65%] rounded-full border border-[#39ff88]/35"
                          />
                          <div className="relative z-10 text-center">
                            <Sparkles className="mx-auto h-10 w-10 text-[#39ff88]" />
                            <p className="mt-3 text-sm tracking-[0.17em] text-[#89ffe5]">AI METHODOLOGY CORE</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </section>

            <section className="relative z-10 mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
              <div className="mb-8">
                <p className="text-sm text-[#87f5d6]">Core Features</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Built for Tunisian Bac success</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {FEATURES.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.35, delay: index * 0.04 }}
                    whileHover={{ y: -6, scale: 1.01 }}
                    className="group rounded-2xl border border-white/12 bg-[rgba(255,255,255,0.06)] p-5 backdrop-blur-xl transition"
                  >
                    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#00f0ff]/40 bg-[#00f0ff]/10 text-[#8bf4ff]">
                      <Bot className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-[#d8d8de] transition group-hover:text-white">{feature}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="relative z-10 mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
              <div className="mb-8">
                <p className="text-sm text-[#87f5d6]">Subjects</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Main Bac and A1 language tracks</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {SUBJECTS.map((subject, idx) => (
                  <motion.button
                    key={subject}
                    onClick={() => {
                      setSelectedSubject(subject);
                      setView("chat");
                    }}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ delay: idx * 0.04 }}
                    whileHover={{ rotateX: 8, rotateY: -8, y: -4 }}
                    className="rounded-2xl border border-white/12 bg-[linear-gradient(155deg,rgba(57,255,136,0.08),rgba(0,240,255,0.06),rgba(15,15,18,0.92))] px-5 py-6 text-left [transform-style:preserve-3d]"
                  >
                    <p className="text-base font-medium text-[#f5f5f5]">{subject}</p>
                    <p className="mt-2 text-sm text-[#9ca0ab]">Open guided methodology prompts</p>
                  </motion.button>
                ))}
              </div>
            </section>

            <section className="relative z-10 mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-[#87f5d6]">Pricing</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">Flouci auto checkout</h2>
                </div>
                <p className="text-xs text-[#a4a9b3]">Pay instantly and verify automatically</p>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <motion.div
                  whileHover={{ y: -6 }}
                  className="rounded-3xl border border-white/15 bg-[rgba(255,255,255,0.06)] p-6 backdrop-blur-2xl"
                >
                  <p className="text-sm text-[#9df6d8]">FREE PLAN</p>
                  <p className="mt-2 text-3xl font-semibold">0 TND</p>
                  <div className="mt-5 space-y-3 text-sm text-[#d8d8dd]">
                    {["Unlimited messages", "Basic AI support", "Standard methodology", "Fast answers"].map((item) => (
                      <p key={item} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-[#39ff88]" />
                        {item}
                      </p>
                    ))}
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="rounded-3xl border border-[#00f0ff]/35 bg-[linear-gradient(150deg,rgba(0,240,255,0.12),rgba(57,255,136,0.1),rgba(15,15,18,0.8))] p-6 shadow-[0_0_35px_rgba(0,240,255,0.2)] backdrop-blur-2xl"
                >
                  <p className="text-sm text-[#9defff]">PREMIUM PLAN</p>
                  <p className="mt-2 text-3xl font-semibold">29 TND</p>
                  <div className="mt-5 space-y-3 text-sm text-[#e4e4ea]">
                    {[
                      "Advanced methodology",
                      "Better corrections",
                      "Smart organization",
                      "Faster AI",
                      "Priority experience",
                    ].map((item) => (
                      <p key={item} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-[#00f0ff]" />
                        {item}
                      </p>
                    ))}
                  </div>
                  <button
                    onClick={() => void startFlouciCheckout()}
                    disabled={isCreatingPayment}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#00f0ff]/60 bg-[#00f0ff]/15 px-4 py-3 text-sm font-medium text-[#b6f8ff] transition hover:bg-[#00f0ff]/22 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isCreatingPayment ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                    {isCreatingPayment ? "Creating secure payment..." : "Pay with Flouci"}
                  </button>
                  {paymentError && <p className="mt-3 text-xs text-rose-200">{paymentError}</p>}
                </motion.div>
              </div>
            </section>
          </motion.main>
        ) : (
          <motion.main
            key="chat"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 h-[calc(100vh-66px)]"
          >
            <div className="mx-auto grid h-full w-full max-w-7xl gap-4 p-4 sm:p-6 lg:grid-cols-[290px_1fr] lg:gap-6">
              <aside
                className={`fixed inset-y-[66px] left-0 z-40 w-[84%] border-r border-white/10 bg-[#08080a]/95 p-4 backdrop-blur-xl transition-transform duration-300 lg:static lg:w-auto lg:translate-x-0 lg:rounded-2xl lg:border lg:border-white/10 lg:bg-[rgba(255,255,255,0.04)] ${
                  mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
              >
                <div className="mb-4 flex items-center justify-between lg:hidden">
                  <BacFelJibLogo compact />
                  <button
                    className="rounded-md border border-white/15 p-2"
                    onClick={() => setMobileSidebarOpen(false)}
                    aria-label="Close sidebar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs tracking-[0.13em] text-[#86f7d2]">SUBJECT NAVIGATION</p>
                <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-1">
                  {SUBJECTS.map((subject) => {
                    const active = selectedSubject === subject;
                    return (
                      <button
                        key={subject}
                        onClick={() => {
                          setSelectedSubject(subject);
                          setMobileSidebarOpen(false);
                        }}
                        className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                          active
                            ? "border-[#39ff88]/60 bg-[#39ff88]/15 text-[#afffdb]"
                            : "border-white/15 bg-white/5 text-[#cfd3db] hover:border-white/40"
                        }`}
                      >
                        {subject}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <p className="mb-3 text-xs tracking-[0.13em] text-[#86f7d2]">SUGGESTED PROMPTS</p>
                  <div className="space-y-2">
                    {suggestedPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => {
                          setInput(prompt);
                          setMobileSidebarOpen(false);
                        }}
                        className="w-full rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-left text-xs text-[#d0d4dd] transition hover:border-[#00f0ff]/55 hover:text-white"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>

              <section className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.04)] backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-3">
                    <button
                      className="rounded-lg border border-white/15 p-2 lg:hidden"
                      onClick={() => setMobileSidebarOpen(true)}
                      aria-label="Open sidebar"
                    >
                      <Menu className="h-4 w-4" />
                    </button>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#39ff88]/40 bg-[#39ff88]/10 text-[#9effd8]">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Bac Fel Jib AI</p>
                      <p className="text-xs text-[#9da2ad]">{selectedSubject} Mode</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={regenerate}
                      disabled={isStreaming || messages.length === 0}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-[#d4d8e2] disabled:opacity-50"
                    >
                      <RefreshCcw className="h-3.5 w-3.5" />
                      Regenerate
                    </button>
                    <button
                      onClick={clearChat}
                      disabled={isStreaming || messages.length === 0}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-[#d4d8e2] disabled:opacity-50"
                    >
                      <Eraser className="h-3.5 w-3.5" />
                      Clear
                    </button>
                  </div>
                </div>

                <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
                  {messages.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mx-auto max-w-2xl py-12 text-center"
                    >
                      <MessageSquarePlus className="mx-auto h-9 w-9 text-[#39ff88]" />
                      <h3 className="mt-3 text-xl font-medium">Start your Bac-focused AI chat</h3>
                      <p className="mt-2 text-sm text-[#aeb2bc]">
                        Ask about writing methodology, reading comprehension, philosophy plans, and exam answering strategy.
                      </p>
                    </motion.div>
                  )}

                  {messages.map((message, index) => {
                    const isAssistant = message.role === "assistant";
                    const isLatest = index === messages.length - 1;
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`group max-w-[92%] rounded-2xl border px-4 py-3 sm:max-w-[80%] ${
                            isAssistant
                              ? "border-[#00f0ff]/30 bg-[#00f0ff]/[0.08]"
                              : "border-[#39ff88]/25 bg-[#39ff88]/[0.08]"
                          }`}
                        >
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div className="inline-flex items-center gap-2 text-xs text-[#9fa5b2]">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-white/5">
                                {isAssistant ? <Bot className="h-3.5 w-3.5" /> : <Languages className="h-3.5 w-3.5" />}
                              </span>
                              {isAssistant ? "Bac Fel Jib AI" : "You"}
                            </div>
                            <button
                              onClick={() => copyMessage(message.id, message.content)}
                              className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-[#aeb4bf] opacity-0 transition group-hover:opacity-100"
                            >
                              {copiedId === message.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} Copy
                            </button>
                          </div>

                          <div className="prose prose-invert prose-sm max-w-none text-[#e8e9ed]">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content || "..."}</ReactMarkdown>
                          </div>

                          {isAssistant && isStreaming && isLatest && (
                            <div className="mt-2 inline-flex items-center gap-2 text-xs text-[#96effb]">
                              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                              Typing
                              <span className="typing-cursor" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}

                  {isStreaming && messages[messages.length - 1]?.content.length === 0 && (
                    <div className="space-y-2">
                      <div className="h-3 w-52 animate-pulse rounded bg-white/10" />
                      <div className="h-3 w-72 animate-pulse rounded bg-white/10" />
                    </div>
                  )}
                </div>

                {apiError && (
                  <div className="mx-4 mb-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200 sm:mx-6">
                    {apiError}
                  </div>
                )}

                <div className="border-t border-white/10 px-4 py-4 sm:px-6">
                  <div className="rounded-2xl border border-white/15 bg-[#0f0f12]/85 p-2 backdrop-blur-xl">
                    <div className="flex items-end gap-2">
                      <textarea
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            void sendMessage();
                          }
                        }}
                        placeholder="Ask Bac Fel Jib AI about methodology, essay writing, comprehension, or philosophy strategy..."
                        className="min-h-[56px] w-full resize-none bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-[#838a96]"
                      />
                      <button
                        onClick={() => void sendMessage()}
                        disabled={isStreaming || !input.trim()}
                        className="mb-1 mr-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#39ff88]/55 bg-[#39ff88]/15 text-[#a6ffd8] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Send message"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}

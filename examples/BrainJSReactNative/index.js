const brain = require('brain.js');
const fs = require('fs');
const LineByLineReader = require('line-by-line');

let net = new brain.NeuralNetwork();
net.fromJSON(
    JSON.parse(
      fs.readFileSync("trained-model.json").toString()
    )
)

const trainingData = [
    {
        input: `Fuck being on some chill shit
        We go 0 to 100 nigga, real quick
        They be on that rap-to-pay-the-bill shit`,
        output: { Drake: 1 }
    },{
        input: `Still like, "Can you hit it with your OVO goose on?"
        I'm like, "What are you on?"
        Told me that she two on, ha, that's cute we a few on
        I could show you what to do in this bitch`, 
        output: { Drake: 1 }
    },{
        input: `All you self promoters are janky
        We established like the Yankees
        This whole fucking game thank us
        We movin' militant but somehow you the one tankin'`,
        output: { Drake: 1 }
    },{
        input: `You underestimated greatly
        Most number ones ever, how long did it really take me
        The part I love most is they need me more than they hate me
        So they never take shots, I got everybody on safety
        I could load every gun with bullets that fire backwards`,
        output: { Drake: 1 }
    },{
        input: `Yeah uh yeah
        These are my one St Thomas flows
        Me and my niggas and some Madonna hoes
        That look just like virgins`,
        output: { Drake: 1 }
    },{
        input: `Stance on lean, leg up on the wall
        My people they chill, why you haters wanna ball
        I'm satisfied with a little, why you haters want it all
        You waiting for the Spring, and I'm gettin it in the fall
        But uh, do what you do what you, I do what I do
        Do's what you do, I do what I do`,
        output: { Drake: 1 }
    },{
        input: `Yo I wake up every morning, shower, gather my belongings
        Yo I wake up every morning, shower, gather my belongings
        Head to works, I get some breakfast 'cause, still a nigga yawning
        From the night before, at the club I was up I'm tryna live
        Only twenty two my nig, 'bout to be twenty three ya dig?`,
        output: { Drake: 1 }
    },{
        input: `This the record that my backpack underground fans get to get to skippin
        Back back, Southern town fans get to tippin
        Chasin fat stacks, runnin down grands and submission
        I don't back track, every single sound for me different
        I don't own no ice, just got clean rap`,
        output: { Drake: 1 }
    },{
        input: `Yesterday when we were getting high, you were invited.
        You would've liked it. I-I know you all too well.
        I said that we could kiss the past goodbye, but you weren't excited, there's no way to fight it.
        You can stay but shawty here I go...`,
        output: { Drake: 1 }
    },{
        input: `I know way too many people here right now that I didn't know last year
        Who the fuck are y'all?
        I swear it feels like the last few nights we've been everywhere and back
        But I just can't remember it all
        What am I doing, what am I doing?
        Oh, yeah, that's right.
        I'm doing me, I'm doing me
        I'm living life right now, man
        And this what I'mma do 'til it's over
        'Til it's over. It's far from over`,
        output: { Drake: 1 }
    },{
        input: `Hi kids! Do you like violence? (Yeah yeah yeah!)
        Wanna see me stick Nine Inch Nails through each one of my eyelids? (Uh-huh!)
        Wanna copy me and do exactly like I did? (Yeah yeah!)
        Try 'cid and get fucked up worse that my life is? (Huh?)`,
        output: { Eminem: 1 }
    },{
        input: `Meet Eddie, twenty-three-years-old
        Fed up with life and the way things are going, he decides to rob a liquor store
        ("I can't take this no more, I can't take it no more homes")
        But on his way in, he has a sudden change of heart
        And suddenly, his conscience comes into play
        ("Shit is mine, I gotta do this, gotta do this")`,
        output: { Eminem: 1 }
    },{
        input: `My tea's gone cold I'm wondering why I got out of bed at all
        The morning rain clouds up my window and I can't see at all
        And even if I could it'll all be gray, but your picture on my wall
        It reminds me, that it's not so bad, it's not so bad`,
        output: { Eminem: 1 }
    },{
        input: `America, we love you
        How many people are proud to be citizens of this beautiful country of ours
        The stripes and the stars for the rights that men have died for to protect the women and men who have broke their necks for the freedom of speech the United States Government has sworn to uphold
        (Yo', I want everybody to listen to the words of this song) or so we're told...`,
        output: { Eminem: 1 }
    },{
        input:  `
        I'm sorry mama!
        I never meant to hurt you!
        I never meant to make you cry; but tonight
        I'm cleaning out my closet (one more time)
        I said I'm sorry mama!
        I never meant to hurt you!
        I never meant to make you cry, but tonight
        I'm cleaning out my closet`,
        output: {Eminem: 1 }
    },{
        input: `Look, I was gonna go easy on you not to hurt your feelings
        But I'm only going to get this one chance
        (Six minutes, six minutes)
        Something's wrong, I can feel it
        (Six minutes, six minutes, Slim Shady, you're on)
        Just a feeling I've got
        Like something's about to happen`,
        output: { Eminem: 1 }
    },{
        input: `His palms are sweaty, knees weak, arms are heavy
        There's vomit on his sweater already, mom's spaghetti
        He's nervous, but on the surface he looks calm and ready to drop bombs,
        But he keeps on forgetting what he wrote down,
        The whole crowd goes so loud`,
        output: { Eminem: 1 }
    },{
        input: `'Cause I know you want me baby
        I think I want you too
        "I think I love you baby"
        I think I love you too
        I'm here to save you girl
        Come be in Shady's world
        I wanna grow together
        Let's let our love unfurl`,
        output: { Eminem: 1 }
    },{
        input: `I'm a soldier, I'm a soldier, I'm a soldier, I'm a soldier
        Yo', never was a thug, just infatuated with guns
        Never was a gangster, 'til I graduated to one
        And got the rep of a villain
        For weapon concealin'
        Took the image of a thug, kept shit appealin'`,
        output: { Eminem: 1 }
    },{
        input: `two trailer park girls go 'round the outside, 'round the outside, 'round the outside
        Guess who's back, back again
        Shady's back, tell a friend
        Guess who's back,
        guess who's back,
        guess who's back,
        guess who's back
        guess who's back
        Guess who's back...`,
        output: { Eminem: 1 }
    }
]

//credit - Daniel Simmons - https://itnext.io/you-can-build-a-neural-network-in-javascript-even-if-you-dont-really-understand-neural-networks-e63e12713a3
let trainedNet;

function encode(arg) {
    return arg.split('').map(x => (x.charCodeAt(0) / 256));
}

function processTrainingData(data) {
    return data.map(d => {
        return {
            input: encode(d.input),
            output: d.output
        }
    })
}

// net.train(processTrainingData(trainingData),{
//     logPeriod:1,
//     log:true,
//     errorThresh: 0.001
// });

//Lyrics the network hasn't seen before, 
//network results = { Drake: 0.8304872512817383, Eminem: 0.1666770577430725 }
// 83 % confident it's Drake lyrics

let results = net.run(encode(`Thinkin' out loud
I must have a quarter million on me right now
Hard to make a song 'bout somethin' other than the money
Two things I'm a bout to talk a blunt and staying blunted
Pretty women are you here?
Are you here right now? Huh?`));

console.log(results)

//Write trained model to disk

// var json = net.toJSON()
// fs.writeFileSync("trained-model.json", JSON.stringify(json));
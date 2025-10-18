// Script to add test posts via API
// Run this in the browser console when logged in

const testPosts = [
  // Technology posts
  {
    title: "Breaking: New AI Model Revolutionizes Healthcare",
    content: "Technology leaders announced today a groundbreaking AI model that can diagnose diseases with 99% accuracy. This technology breakthrough represents a major advancement in medical diagnostics, potentially saving millions of lives. The model was trained on vast datasets and shows promising results in early trials.",
    category: "technology"
  },
  {
    title: "Apple Unveils Revolutionary New iPhone with Holographic Display",
    content: "In a stunning announcement, Apple revealed their latest iPhone featuring holographic display technology. This cutting-edge technology allows users to project 3D images into the air. The new device is expected to revolutionize mobile computing and entertainment.",
    category: "technology"
  },
  {
    title: "Quantum Computing Breakthrough: 1000-Qubit Processor Achieved",
    content: "Scientists have successfully created a 1000-qubit quantum processor, marking a significant milestone in quantum computing technology. This achievement brings us closer to solving complex problems that current computers cannot handle.",
    category: "technology"
  },

  // Sports posts
  {
    title: "World Cup Final: Underdogs Claim Victory in Thrilling Match",
    content: "In an unexpected turn of events, the underdog team won the World Cup in a nail-biting final. Sports fans around the world witnessed history as the team scored in the final minutes. This sports triumph will be remembered for generations.",
    category: "sports"
  },
  {
    title: "Olympic Records Shattered in Swimming Championships",
    content: "Multiple world records were broken today at the Olympic swimming championships. Athletes pushed the boundaries of human performance in this sports spectacle. The competition featured incredible displays of speed and endurance.",
    category: "sports"
  },
  {
    title: "Tennis Legend Announces Retirement After 20-Year Career",
    content: "After two decades of dominating the tennis world, the legendary player announced retirement. This sports icon has won 23 Grand Slam titles and inspired millions. Fans worldwide pay tribute to an extraordinary career.",
    category: "sports"
  },

  // Entertainment posts
  {
    title: "Blockbuster Movie Breaks All-Time Box Office Records",
    content: "The latest superhero movie has shattered box office records worldwide. Entertainment industry experts are calling it the most successful film launch in history. The movie earned over $1 billion in its opening weekend.",
    category: "entertainment"
  },
  {
    title: "Music Festival Announces Star-Studded Lineup for 2025",
    content: "The world's biggest music festival revealed an incredible lineup for next year. Entertainment fans are rushing to buy tickets as top artists are confirmed. The festival promises to be the entertainment event of the decade.",
    category: "entertainment"
  },
  {
    title: "Streaming Service Launches Revolutionary Interactive Shows",
    content: "A major streaming platform announced a new format of interactive entertainment. Viewers can now influence storylines in real-time during shows. This innovation is set to transform the entertainment industry.",
    category: "entertainment"
  },

  // Politics posts
  {
    title: "Historic Peace Agreement Signed Between Nations",
    content: "In a momentous occasion, long-standing rivals signed a comprehensive peace treaty. Politics experts believe this could reshape regional dynamics for decades. The agreement includes economic cooperation and security guarantees.",
    category: "politics"
  },
  {
    title: "New Climate Policy Announced at Global Summit",
    content: "World leaders unveiled ambitious climate targets at the international summit. Politics and environmental policy intersect as nations commit to net-zero emissions. The agreement represents unprecedented global cooperation.",
    category: "politics"
  },
  {
    title: "Election Results: Surprising Victory Changes Political Landscape",
    content: "Unexpected election results have transformed the political landscape overnight. Politics analysts are scrambling to understand the implications. The victory marks a significant shift in public sentiment.",
    category: "politics"
  },

  // Science posts
  {
    title: "Mars Colony: First Humans Successfully Land on Red Planet",
    content: "In a historic achievement for science and space exploration, the first human crew has landed on Mars. Scientists confirm all systems are operational and the crew is in good health. This marks the beginning of interplanetary colonization.",
    category: "science"
  },
  {
    title: "Cancer Cure: Scientists Announce Major Breakthrough",
    content: "Researchers have discovered a potential universal cure for cancer. Science teams worldwide are validating the groundbreaking findings. Early trials show 95% success rate in eliminating tumors.",
    category: "science"
  },
  {
    title: "Climate Science: New Technology Reverses Global Warming",
    content: "Scientists have developed technology that can effectively remove CO2 from the atmosphere. This science breakthrough offers hope for reversing climate change. The technology is scalable and cost-effective.",
    category: "science"
  },

  // Mixed/General posts
  {
    title: "Local Hero Saves Family from Fire",
    content: "A brave individual rescued a family of five from a burning building yesterday. The community is celebrating this heroic act of courage. The hero modest about their actions, saying anyone would have done the same.",
    category: "general"
  },
  {
    title: "Economic Report: Markets Reach All-Time High",
    content: "Stock markets around the world reached record levels today. Economists attribute the growth to strong consumer confidence and technological innovation. Investors are optimistic about continued growth.",
    category: "general"
  },
  {
    title: "Education Reform: New System Transforms Learning",
    content: "A revolutionary education system is being implemented nationwide. The new approach focuses on personalized learning and practical skills. Early results show significant improvement in student engagement.",
    category: "general"
  }
];

// Function to add posts
async function addTestPosts() {
  let successCount = 0;
  let failCount = 0;

  for (const post of testPosts) {
    try {
      const response = await fetch('/post/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(post)
      });

      if (response.ok) {
        successCount++;
        console.log(`✅ Added: ${post.title}`);
      } else {
        failCount++;
        console.error(`❌ Failed to add: ${post.title}`, await response.text());
      }
    } catch (error) {
      failCount++;
      console.error(`❌ Error adding: ${post.title}`, error);
    }

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n📊 Results: ${successCount} posts added successfully, ${failCount} failed`);
  console.log('🔄 Refresh the page to see the new posts!');
}

// Run the function
console.log('🚀 Starting to add test posts...');
console.log('📝 This will add 18 diverse posts across different categories');
addTestPosts();
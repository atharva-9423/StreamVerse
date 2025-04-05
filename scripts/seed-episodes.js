// Script to add real anime episodes to the database
import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seedEpisodes() {
  try {
    // Demon Slayer (ID: 1)
    const demonSlayerEpisodes = [
      {
        anime_id: 1,
        title: "Cruelty",
        episode_number: 1,
        season_number: 1,
        thumbnail: "https://m.media-amazon.com/images/M/MV5BNDY2Y2IwMDAtZGI3Yy00MzRkLTgyMWMtYjEyNzYwZjBkNDk0XkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
        duration: 1440,
        overview: "Tanjiro Kamado is living a modest but blissful life in the mountains with his family. After returning home from selling charcoal, he finds his family has been slaughtered by demons, with only his sister Nezuko surviving but transformed into a demon.",
        video_url: "/videos/demon_slayer/episode_1.mp4"
      },
      {
        anime_id: 1,
        title: "Trainer Sakonji Urokodaki",
        episode_number: 2,
        season_number: 1,
        thumbnail: "https://m.media-amazon.com/images/M/MV5BNWNkZmM4YmEtZWZhYS00OThjLTlkNzEtOWUzZjQyMDgyZjJlXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
        duration: 1440,
        overview: "Tanjiro begins his journey to find a cure for Nezuko. He meets Giyu Tomioka who directs him to Sakonji Urokodaki, a former Demon Slayer who might be able to help.",
        video_url: "/videos/demon_slayer/episode_2.mp4"
      },
      {
        anime_id: 1,
        title: "Sabito and Makomo",
        episode_number: 3,
        season_number: 1,
        thumbnail: "https://m.media-amazon.com/images/M/MV5BMmM5NGUxYTItYzdjNC00N2U1LTk0NzgtZmRmMjBiODEwMzU2XkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
        duration: 1440,
        overview: "Tanjiro trains with Urokodaki to become a Demon Slayer. He meets two mysterious children, Sabito and Makomo, who help him prepare for the Final Selection test.",
        video_url: "/videos/demon_slayer/episode_3.mp4"
      },
      {
        anime_id: 1,
        title: "Final Selection",
        episode_number: 4,
        season_number: 1,
        thumbnail: "https://m.media-amazon.com/images/M/MV5BZWJlZTlhN2YtMzg4ZS00NDNkLTgyNTYtMDMwOTFiMGRmMGNhXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
        duration: 1440,
        overview: "Tanjiro enters the Final Selection, a dangerous test where prospective Demon Slayers must survive for seven days on a mountain filled with demons.",
        video_url: "/videos/demon_slayer/episode_4.mp4"
      },
      {
        anime_id: 1,
        title: "My Own Steel",
        episode_number: 5,
        season_number: 1,
        thumbnail: "https://m.media-amazon.com/images/M/MV5BYTU0N2IwNTctN2VjZi00MzUxLTlmYjAtZDdiYTBiM2NkODQyXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
        duration: 1440,
        overview: "After passing the Final Selection, Tanjiro receives his own Nichirin Sword, which changes color based on the owner's breath style and potential.",
        video_url: "/videos/demon_slayer/episode_5.mp4"
      }
    ];

    // Attack on Titan (ID: 2)
    const attackOnTitanEpisodes = [
      {
        anime_id: 2,
        title: "To You, 2000 Years From Now",
        episode_number: 1,
        season_number: 1,
        thumbnail: "https://m.media-amazon.com/images/M/MV5BNWJlN2YzY2ItMTU0My00ZWI2LTlmZmYtNTZiNGI0MGYzMzhiXkEyXkFqcGdeQWxiaWFtb250._V1_.jpg",
        duration: 1440,
        overview: "After 100 years of peace, humanity is suddenly reminded of the terror of being at the Titans' mercy when a Colossal Titan breaches the wall protecting the town of Shiganshina.",
        video_url: "/videos/attack_on_titan/episode_1.mp4"
      },
      {
        anime_id: 2,
        title: "That Day: The Fall of Shiganshina, Part 1",
        episode_number: 2,
        season_number: 1,
        thumbnail: "https://m.media-amazon.com/images/M/MV5BNGYwYmQyYjItMmQ0YS00Yzc5LWJjOGYtNGI1OTkwZGJlODM0XkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
        duration: 1440,
        overview: "After the Titan breaches Wall Maria, a young Eren Yeager witnesses the death of his mother at the hands of a Titan, instilling in him a desire for vengeance.",
        video_url: "/videos/attack_on_titan/episode_2.mp4"
      },
      {
        anime_id: 2,
        title: "A Dim Light Amid Despair: Humanity's Comeback, Part 1",
        episode_number: 3,
        season_number: 1,
        thumbnail: "https://m.media-amazon.com/images/M/MV5BNWJlN2YzY2ItMTU0My00ZWI2LTlmZmYtNTZiNGI0MGYzMzhiXkEyXkFqcGdeQWxiaWFtb250._V1_.jpg",
        duration: 1440,
        overview: "Five years after the fall of Wall Maria, Eren, Mikasa, and Armin enlist in the military with hopes of joining the Scout Regiment.",
        video_url: "/videos/attack_on_titan/episode_3.mp4"
      },
      {
        anime_id: 2,
        title: "The Night of the Closing Ceremony: Humanity's Comeback, Part 2",
        episode_number: 4,
        season_number: 1,
        thumbnail: "https://m.media-amazon.com/images/M/MV5BNjU4ZGM5MGItNWFlZi00OGIwLWI2YWMtNTQ1ZWQ1MGRiMWU5XkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
        duration: 1440,
        overview: "Training to become soldiers who battle Titans, Eren and his friends struggle with the harsh reality of their situation.",
        video_url: "/videos/attack_on_titan/episode_4.mp4"
      },
      {
        anime_id: 2,
        title: "First Battle: The Struggle for Trost, Part 1",
        episode_number: 5,
        season_number: 1,
        thumbnail: "https://m.media-amazon.com/images/M/MV5BNGFlNzFjMTMtYmFhNi00NDE5LTk0MjItMjg0NWI2MmJiZDRiXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
        duration: 1440,
        overview: "The 104th Training Corps graduates, and its members are assigned to their military positions. A Colossal Titan appears again and breaks the wall, allowing Titans to invade.",
        video_url: "/videos/attack_on_titan/episode_5.mp4"
      }
    ];

    // Jujutsu Kaisen (ID: 3)
    const jujutsuKaisenEpisodes = [
      {
        anime_id: 3,
        title: "Ryomen Sukuna",
        episode_number: 1,
        season_number: 1,
        thumbnail: "https://m.media-amazon.com/images/M/MV5BOTdiY2Q5MDQtYTA5ZS00YzJkLWEzM2UtNWRjMjY5NThmNDZkXkEyXkFqcGdeQXVyODc0OTEyNDU@._V1_.jpg",
        duration: 1440,
        overview: "After learning that his grandfather's friend is hospitalized, Yuji Itadori meets up with Megumi Fushiguro, who is looking for a special talisman.",
        video_url: "/videos/jujutsu_kaisen/episode_1.mp4"
      },
      {
        anime_id: 3,
        title: "For Myself",
        episode_number: 2,
        season_number: 1,
        thumbnail: "https://m.media-amazon.com/images/M/MV5BOGM3NDA2N2UtODk2ZS00MTY1LWE0YmYtMGM4MzUxN2ExNjZlXkEyXkFqcGdeQXVyODc0OTEyNDU@._V1_.jpg",
        duration: 1440,
        overview: "Yuji makes a life-changing decision as his school is attacked by curses. Megumi fights to protect him while Satoru Gojo arrives to handle the situation.",
        video_url: "/videos/jujutsu_kaisen/episode_2.mp4"
      },
      {
        anime_id: 3,
        title: "Girl of Steel",
        episode_number: 3,
        season_number: 1,
        thumbnail: "https://m.media-amazon.com/images/M/MV5BYWRmYTNkYTQtYzViYi00MGY1LTk0MTAtYjgzMjZmYmY5NGZjXkEyXkFqcGdeQXVyMTQ3MjMyMTYz._V1_.jpg",
        duration: 1440,
        overview: "Yuji begins his new life as a jujutsu sorcerer in training. He meets Nobara Kugisaki, and together with Megumi, they are assigned their first mission.",
        video_url: "/videos/jujutsu_kaisen/episode_3.mp4"
      },
      {
        anime_id: 3,
        title: "Curse Womb Must Die",
        episode_number: 4,
        season_number: 1,
        thumbnail: "https://m.media-amazon.com/images/M/MV5BMjc0YWYwY2EtZGNkYy00NGE1LTlhZWYtYmRjZjY5Y2FkNTlmXkEyXkFqcGdeQXVyMTQ3MjMyMTYz._V1_.jpg",
        duration: 1440,
        overview: "The trio of Yuji, Megumi, and Nobara face their first major threat: a special grade curse that has taken over an abandoned building.",
        video_url: "/videos/jujutsu_kaisen/episode_4.mp4"
      },
      {
        anime_id: 3,
        title: "Curse Womb Must Die II",
        episode_number: 5,
        season_number: 1,
        thumbnail: "https://m.media-amazon.com/images/M/MV5BNjViZjAyNDEtZGMxYi00YjgxLTkzNDktZWQ5YTU2OTZiZGNmXkEyXkFqcGdeQXVyMTQ3MjMyMTYz._V1_.jpg",
        duration: 1440,
        overview: "The battle against the special grade curse continues, pushing the young sorcerers to their limits. Sukuna's power becomes a tempting solution.",
        video_url: "/videos/jujutsu_kaisen/episode_5.mp4"
      }
    ];

    // One Piece (ID: 22)
    const onePieceEpisodes = [
      {
        anime_id: 22,
        title: "I'm Luffy! The Man Who's Gonna Be King of the Pirates!",
        episode_number: 1,
        season_number: 1,
        thumbnail: "https://m.media-amazon.com/images/M/MV5BODM3OWY5OTAtZGQ5Yi00YmJkLWI4YzYtOWJjNDBlNDI2YjI0XkEyXkFqcGdeQXVyNTgyODQ5MDU@._V1_.jpg",
        duration: 1440,
        overview: "The series begins with the execution of Gold Roger, the Pirate King. Before his death, Roger announces that his treasure, the One Piece, is hidden somewhere on the Grand Line.",
        video_url: "/videos/one_piece/episode_1.mp4"
      },
      {
        anime_id: 22,
        title: "Enter the Great Swordsman! Pirate Hunter Roronoa Zoro!",
        episode_number: 2,
        season_number: 1,
        thumbnail: "https://m.media-amazon.com/images/M/MV5BYjc0MWFkMTEtZGY5OS00OGJiLWI4OTgtM2RlZWFhMmQzMDIwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
        duration: 1440,
        overview: "Luffy reaches the first town on his journey and hears about a bounty hunter named Roronoa Zoro. Determined to recruit him for his crew, Luffy sets out to find him.",
        video_url: "/videos/one_piece/episode_2.mp4"
      },
      {
        anime_id: 22,
        title: "Morgan versus Luffy! Who's the Mysterious Pretty Girl?",
        episode_number: 3,
        season_number: 1,
        thumbnail: "https://m.media-amazon.com/images/M/MV5BZmJmNDQ0YmEtNTY3Zi00MDUzLTgxZTEtZjkzNGI2ZjUzYzI0XkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
        duration: 1440,
        overview: "Luffy and Zoro face off against Captain Morgan, the corrupt Marine officer ruling over the town. They meet a girl named Nami who has her own reasons for being there.",
        video_url: "/videos/one_piece/episode_3.mp4"
      },
      {
        anime_id: 22,
        title: "Luffy's Past! The Red-haired Shanks Appears!",
        episode_number: 4,
        season_number: 1,
        thumbnail: "https://m.media-amazon.com/images/M/MV5BNDFmNzRhZTQtNzRkZi00ZTJkLWI1YTQtN2ZmYTcwNjE0ZWM3XkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
        duration: 1440,
        overview: "A flashback reveals Luffy's childhood and how he met the pirate captain Shanks, who inspired him to become a pirate and gave him his straw hat.",
        video_url: "/videos/one_piece/episode_4.mp4"
      },
      {
        anime_id: 22,
        title: "A Terrifying Mysterious Power! Captain Buggy, the Clown Pirate!",
        episode_number: 5,
        season_number: 1,
        thumbnail: "https://m.media-amazon.com/images/M/MV5BM2RiMzRiNWItMDgwMC00N2E0LTlmODEtYzVlOTQyNGIxNTE2XkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
        duration: 1440,
        overview: "Luffy and his new navigator Nami encounter Buggy the Clown, a dangerous pirate with the power of the Chop-Chop Fruit, which allows him to split his body into parts.",
        video_url: "/videos/one_piece/episode_5.mp4"
      }
    ];

    // My Hero Academia (ID: 17)
    const myHeroAcademiaEpisodes = [
      {
        anime_id: 17,
        title: "Izuku Midoriya: Origin",
        episode_number: 1,
        season_number: 1,
        thumbnail: "https://m.media-amazon.com/images/M/MV5BM2E0ZGRhYzgtNzA4YS00NWZhLTkxOGItYmJmYmE3MWMyMDc2XkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
        duration: 1440,
        overview: "In a world where people with superpowers known as 'Quirks' are the norm, Izuku Midoriya has dreams of being a hero despite being Quirkless.",
        video_url: "/videos/my_hero_academia/episode_1.mp4"
      },
      {
        anime_id: 17,
        title: "What It Takes to Be a Hero",
        episode_number: 2,
        season_number: 1,
        thumbnail: "https://m.media-amazon.com/images/M/MV5BMDk0MTI5NjAtZGE5Mi00NjIwLWI3OWItMTY5NWE5MDZkMDU5XkEyXkFqcGdeQXVyNTk5Nzg0MDE@._V1_.jpg",
        duration: 1440,
        overview: "After encountering his idol All Might, Izuku learns the truth behind being a hero and inherits All Might's power, known as One For All.",
        video_url: "/videos/my_hero_academia/episode_2.mp4"
      },
      {
        anime_id: 17,
        title: "Roaring Muscles",
        episode_number: 3,
        season_number: 1,
        thumbnail: "https://m.media-amazon.com/images/M/MV5BZWNiNjE0NTgtNGQ5YS00Y2M4LWE0MDMtOTc2MTJlMWRlOGQ2XkEyXkFqcGdeQXVyNTk5Nzg0MDE@._V1_.jpg",
        duration: 1440,
        overview: "Izuku undergoes intense training with All Might to prepare his body to handle the powerful Quirk that will be bestowed upon him.",
        video_url: "/videos/my_hero_academia/episode_3.mp4"
      },
      {
        anime_id: 17,
        title: "Start Line",
        episode_number: 4,
        season_number: 1,
        thumbnail: "https://m.media-amazon.com/images/M/MV5BZTVkYThjMmUtOTM0Yy00MmIyLWIzMzItYTIzYzNmMzBhYTE0XkEyXkFqcGdeQXVyNTk5Nzg0MDE@._V1_.jpg",
        duration: 1440,
        overview: "The day of the U.A. High School entrance exam arrives. Izuku, now possessing One For All, must demonstrate his worth alongside other aspiring heroes.",
        video_url: "/videos/my_hero_academia/episode_4.mp4"
      },
      {
        anime_id: 17,
        title: "What I Can Do for Now",
        episode_number: 5,
        season_number: 1,
        thumbnail: "https://m.media-amazon.com/images/M/MV5BMmI2MjgyYzUtZTEzYi00YjBiLTg2M2UtNjZjOTkwYzU0ZGM5XkEyXkFqcGdeQXVyMzUyMDU0MjU@._V1_.jpg",
        duration: 1440,
        overview: "The entrance exam continues as Izuku struggles to control his new Quirk. When a fellow examinee is in danger, Izuku must make a split-second decision.",
        video_url: "/videos/my_hero_academia/episode_5.mp4"
      }
    ];

    // Delete existing episodes (if any)
    await pool.query('DELETE FROM episodes');
    console.log('Deleted existing episodes');

    // Insert all episodes for each anime series
    for (const episode of [
      ...demonSlayerEpisodes, 
      ...attackOnTitanEpisodes, 
      ...jujutsuKaisenEpisodes,
      ...onePieceEpisodes,
      ...myHeroAcademiaEpisodes
    ]) {
      await pool.query(`
        INSERT INTO episodes (
          anime_id, title, episode_number, season_number, 
          thumbnail, duration, overview, release_date, video_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
      `, [
        episode.anime_id, 
        episode.title, 
        episode.episode_number, 
        episode.season_number,
        episode.thumbnail, 
        episode.duration, 
        episode.overview, 
        episode.video_url
      ]);
      console.log(`Added episode: ${episode.title} (Season ${episode.season_number}, Episode ${episode.episode_number})`);
    }

    console.log('Successfully added all anime episodes');
  } catch (error) {
    console.error('Error seeding episodes:', error);
  } finally {
    pool.end();
  }
}

// Run the seed function
seedEpisodes().catch(console.error);
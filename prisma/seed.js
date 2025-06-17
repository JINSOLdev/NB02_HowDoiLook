import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {

  await prisma.comment.deleteMany({});
  await prisma.curation.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.styleTag.deleteMany({});
  await prisma.styleImage.deleteMany({});
  await prisma.style.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.image.deleteMany({});

  // 1. Seed 태그 (중복 방지)
  const tagNames = [
    '캐주얼', '스트릿', '미니멀', '포멀', '빈티지',
    '스포티', '러블리', '여름', '겨울', '컬러풀'
  ];
  await Promise.all(tagNames.map(name => prisma.tag.upsert({
    where: { name },
    update: {},
    create: { name }
  })));

  // 2. Seed 이미지
  const imageUrls = [
    'https://storage.googleapis.com/nb02-how-do-i-look-storage.firebasestorage.app/images/__style_1750146858645.png?GoogleAccessId=firebase-adminsdk-fbsvc%40nb02-how-do-i-look-storage.iam.gserviceaccount.com&Expires=16730323200&Signature=stnPIB9XI98sgh4vqrG6hRj10ubtrmapoVUQPScSa1lNBx3VsI0LrujekCXG6as4fDjUpp%2BbnNwETbxMDFw7U0SQQJd7jn6GElR1r6NQHD38B8m1JDMwxZOIBHoc66UNb1U94LpDmBc5WyuJBPAd4tGx9aDU5uva8grXSTNHiSg9LQzLoIezW%2FBZNXOHNAVHx%2FqbWnCm4stixhekjPmbXJhQcg5%2F0XWfE8VLoXDHDqvrVoZSQOV2O15JF37D8m%2BQyoFxh7Q9XhFRWmg22R2aw3vDkq99TMdLY%2FSoxI2MiAqFLzVQnfl5arEV2Dn0WjBHWtSHJjcI9Qw7cN8PW6AMeA%3D%3D',
    'https://storage.googleapis.com/nb02-how-do-i-look-storage.firebasestorage.app/images/__style_1750147311122.png?GoogleAccessId=firebase-adminsdk-fbsvc%40nb02-how-do-i-look-storage.iam.gserviceaccount.com&Expires=16730323200&Signature=nBP3QWpl2PIokjugWpxYlPI4mnT8mw0BAe3Dsd1HCXq1kja9dfMxE%2BtxUAFg%2BKTD4TXtBw%2FoXrA36Ltf6aQkLOxvXdTV3SXV%2BvdtCPn2DvID7Hw0CzGNX95qiscLyr75DueyZqjuvjkHzFLn5ouQAfTVeVFaSSJZNBFMrjycLB7KlBw9tET6RfK496vr%2B9ZntuXJx8WiYL6C7Tn8CxjRLaONhKE3O8gRj6pDuRChpwdsrR5cipzVUfR8B0h2xtDAOhV4jXBchJgHhZ0P%2BYi6M1Tn75upwlLK%2Fbx4OvWkPnfmH1Incs6ulS4zVtKtVRleOT45lbWZsMDzZlvlLziAEw%3D%3D',
    'https://storage.googleapis.com/nb02-how-do-i-look-storage.firebasestorage.app/images/__style_1750147359056.png?GoogleAccessId=firebase-adminsdk-fbsvc%40nb02-how-do-i-look-storage.iam.gserviceaccount.com&Expires=16730323200&Signature=uHkbyHzqzHbqftejC5DjSp2W4Gy%2BlqNLXM43Ijd8QOl4Jfj6Or%2FQDWathfcnC%2BvWDCG27v%2Bc5e2xnpfiGGUGyYbWxfsMYIO2Al6AnWmkUkbhT4WuWYeZ0pJfLXm%2Bz%2Fp83pDKcYFK5tBXSGO2aOkm8l4bNMwJ1o6oMlihZWtkthrbAYBntu9RkE%2FajWhJEPY9dgr3gUDOZdh3u4mMMf%2BjMVpIAHWVv%2BWkKEHnvVmQSOmiC0A0uEc5WNNXCeKNKDgkVr%2BBtugMVBeRTeU042Nz0Qvlvr5zeFvr6L5XJffGMH47xWjn7JcZZQs65tJ7g5HIZABW%2Fi0D7UCgh1DTbKjC3A%3D%3D',
    'https://storage.googleapis.com/nb02-how-do-i-look-storage.firebasestorage.app/images/__style_1750147393368.png?GoogleAccessId=firebase-adminsdk-fbsvc%40nb02-how-do-i-look-storage.iam.gserviceaccount.com&Expires=16730323200&Signature=hsorKJjtx%2BLYOCRhmAxgcWKSupyI91cnyxc5Uum%2FRPLXwb9McDH%2Fk2kgOiQ2Uk4O0RE0WYAT2dioJGyAy%2FGMvaC%2BaBfWdGiP2winC6Tw5IghlUSs5oLS1zF6nbFdjG1mQ%2BUr1txQP5JYMVoPc8WQ%2Fu%2BeZwZw%2BLVQu2oHmdQEa9oaiiW2I9nOerc99p%2BQ8KTR1jIkFga721my7pJGyKucKtDeRAjjrp2f3dv2p5ORCU39T0lwy1oulVL9gNyNkAKPKWhy50aP8WpLJlSLB6xU58qWIygfcBR69qvbeMaxg5ASM8IxuTFhnTkaRMruMzciLR5OxWVz17prNkTRngtSaw%3D%3D',
    'https://storage.googleapis.com/nb02-how-do-i-look-storage.firebasestorage.app/images/__style_1750147439907.png?GoogleAccessId=firebase-adminsdk-fbsvc%40nb02-how-do-i-look-storage.iam.gserviceaccount.com&Expires=16730323200&Signature=H5cWC0dbtz35Co02wt3M6yoLSTkBKdf8r4DR79ezBRw8FcrCaYUyqUxTFH6CjXiVLu6m8Jz%2FvKaKjSUJhfbd368JWb%2Bo0djz%2FQRXodaB1uuNFER8VHLoBm5GsDIwOugKWf%2Btc%2BEMM5mz1J69qpXT3sIux3FgIX0TcZ5XhWxH1z4glmb10E9RDthjLHXjZeMuNHz3DybpYipmyPojznYGG7JI2BD39bSjRrIQOxn4EZyybDvhzNgxy9oJfmqr64EsTZZOucadxsvIpkYvWopfRUfAmaj%2Bvus55FNN1dla8r3Acu4U%2FEWwGJPSw%2FBZ0UpUGtKdEDzYWB%2B6IkVAwACGhQ%3D%3D',
    'https://storage.googleapis.com/nb02-how-do-i-look-storage.firebasestorage.app/images/__style_1750147475464.png?GoogleAccessId=firebase-adminsdk-fbsvc%40nb02-how-do-i-look-storage.iam.gserviceaccount.com&Expires=16730323200&Signature=l%2FuQch2A2SL3xay8Grgxg05M9bWijjsdRJXdxQuHzaMtJED00jPOuGGCAyQqvS5tA8tPruo8jGs8lpP8YfPy2diQIYjH2%2B0kUm9GRsEYBhHda2urLlFAjpReCVTskNd2O1qclbLe1IeT7%2FiDmjMZtyG09f%2BEgXWV%2FiHzui30uAmhavi9oPEAoA%2Bs09QIhpcrI4SJfXtxv7FBURyM%2FggrMKfoVTKYm0fkoOD0C%2FMIUP2CasrzM%2B6VDeClupWB5NAaHzXVvwyw9IFqkovSO7%2FQNT1agONrC%2Fuovm%2BBT490fyinu5UhmQnXBMcKM2CSEi7D%2FWw5n7OymnGYs9hfUh8YgA%3D%3D',
    'https://storage.googleapis.com/nb02-how-do-i-look-storage.firebasestorage.app/images/__style_1750147512146.png?GoogleAccessId=firebase-adminsdk-fbsvc%40nb02-how-do-i-look-storage.iam.gserviceaccount.com&Expires=16730323200&Signature=TPl8mMLlHyrVPrJpHQVISLOniMb%2F52npXZanpriGrghRpD3QGIVZqJUC0x3%2BnF0XJ2ejk51GdZG50YB6R1NFIyBPj9Z4Kc45RJm2vYICMwMyGY5EhhAc%2BjWg2%2FeBMZCJTiYjYuJtKXzo%2FvfJnZN%2BuzkHFVUuKypGK6CYH3dZxVwO73yCFT4f1JjdaT7kkj2IzSLj0tNZBFhoF9aGQIVZi21MzoOBwnmfjbWxw10f8V2yo8XyvqVeOrBj8bu8f2l7Yk5jNGFW8cHXiEAXEdvHG6MHxP9gV3xDxNGX0VRIdy%2BL2Oq0hI7dqvxGfyH7%2BBUimR5WDLxlRGh1qOoIklHMdA%3D%3D',
    'https://storage.googleapis.com/nb02-how-do-i-look-storage.firebasestorage.app/images/__style_1750147546378.png?GoogleAccessId=firebase-adminsdk-fbsvc%40nb02-how-do-i-look-storage.iam.gserviceaccount.com&Expires=16730323200&Signature=kaW93yM7qSEOD7sb%2BsDwSeHS7G%2Bf%2FOtJMMaO2HEyOSnim3HvD%2BNoW92O%2FcVAlCuS%2FiQnUcJgBdGCLFxc9wy5pkycqAmYTkIRKCyrlLjKvGLI8mbeXya67O8uykkmEYwz42x0ahS4YK721rKQ9Il%2F8ThMy1Rwt39joSTPd2beRuLwBvL1BNCraUDVn57KzRgrPdWy0HsoM%2F8eUAzAZ3WmzXGiVHXBAdv8FiIkygkyhCjD8kSGmAnn2wJPnF%2FqNVS9pj98%2BGrIIv0YFUSPAEZu0cJM1h4GRhwYMcEvFbpHZ%2BPc3FZmHkT2qk349dvwH57AppswYweZraQfO3fd%2FqSIuw%3D%3D',
    'https://storage.googleapis.com/nb02-how-do-i-look-storage.firebasestorage.app/images/__style_1750147696732.png?GoogleAccessId=firebase-adminsdk-fbsvc%40nb02-how-do-i-look-storage.iam.gserviceaccount.com&Expires=16730323200&Signature=cGjHyJBJ9mkIJODCzyoX2lfoQwMwngqg76NRO4st6UVITB2yb4U0X%2BkvMrJmIDaIhEKaNfZgoe9udJ1ntuBz2IFD1h9yoMNkkwExSArQ7XL6M99%2FDhBz9x7MgBuRZd8cfshQJ4NzehhDc4cDFODrbScsD4TxAMu44hwm8pthu5hucGx2oOT%2FJxVtg3fHhpNf8O4KHvrYkoru6loPeYcHgxz8mQWbInDlhuW1HQig2sg9hWRZl%2BoNVSLfNBKivywWqtCQTi9feW5vOqyAE0vbgxHhRuwWDhZf6Vxnf0Cbi15CZsUhc%2BUa35vsq73jCDSo3H%2B0SPav4O%2B2WQAUvB5YGg%3D%3D',
    'https://storage.googleapis.com/nb02-how-do-i-look-storage.firebasestorage.app/images/__style_1750147730484.png?GoogleAccessId=firebase-adminsdk-fbsvc%40nb02-how-do-i-look-storage.iam.gserviceaccount.com&Expires=16730323200&Signature=Ya9SiaoE4dzsJ9WZi19RdWfpwzwGo0%2BXKUKZGalJloFSv37kfLlvlzMkB34Yn914MyQWbsoGorOgAvFauG%2BRVA%2FD4SUPyR08YIlpGgv9KJUaO15IHpu1Gi72RIFtMUYZ5bELXliWJayx%2BbeyXoiZEB28xdWCwDJn73%2F9kG%2BDnSeR62AzTYscDML8qlaCnFTa3jlpra6No%2BtC4mioHFpVSsue1laqGk%2Ft97BNSMF1qkDMRinvliiBhKQEFvBK04G2sAQB3lxwfHLqX5X9NjoOjJ%2FEyhVyNFeL9SWHE6jsGXbl2ffRQ9f3FiUg2n250aurj8iTlsvNgPBswasEhA8REQ%3D%3D',
    
  ];
  const images = await Promise.all(imageUrls.map(url => prisma.image.create({ data: { imageUrl: url } })));

  // 3. Seed 스타일 10개
  
  const styleDatas = [
    {
      nickname: '혜원',
      title: '여름 미니멀룩',
      content: '린넨 셔츠와 와이드 슬랙스로 미니멀하게!',
      password: 'password1234',
      categories: [
        { type: 'TOP', name: '린넨 셔츠', brand: '무신사', price: 39000n },
        { type: 'BOTTOM', name: '와이드 슬랙스', brand: '코스', price: 79000n },
        { type: 'SHOES', name: '샌들', brand: '버켄스탁', price: 129000n }
      ],
      tagNames: ['미니멀', '여름'],
      imageIdx: [0, 1]
    },
    {
      nickname: '승관',
      title: '빈티지 데님 스타일',
      content: '오버사이즈 청자켓과 찢어진 데님팬츠로 빈티지 무드',
      password: 'password1234',
      categories: [
        { type: 'OUTER', name: '청자켓', brand: '리바이스', price: 99000n },
        { type: 'BOTTOM', name: '데님팬츠', brand: '지오다노', price: 59000n }
      ],
      tagNames: ['빈티지', '캐주얼'],
      imageIdx: [2]
    },
    {
      nickname: '우재',
      title: '포멀 오피스룩',
      content: '블레이저와 슬랙스로 깔끔한 오피스룩',
      password: 'password1234',
      categories: [
        { type: 'TOP', name: '블레이저', brand: '자라', price: 99000n },
        { type: 'BOTTOM', name: '슬랙스', brand: '유니클로', price: 59000n },
        { type: 'SHOES', name: '로퍼', brand: '닥터마틴', price: 139000n }
      ],
      tagNames: ['포멀'],
      imageIdx: [3]
    },
    {
      nickname: '미주',
      title: '컬러풀 썸머룩',
      content: '형광 핑크탑과 옐로우 스커트로 톡톡 튀게!',
      password: 'password1234',
      categories: [
        { type: 'TOP', name: '네온 핑크탑', brand: 'H&M', price: 19000n },
        { type: 'BOTTOM', name: '옐로우 스커트', brand: '자라', price: 39000n }
      ],
      tagNames: ['컬러풀', '여름', '러블리'],
      imageIdx: [4]
    },
    {
      nickname: '보검',
      title: '스트릿 무드',
      content: '후드집업과 카고팬츠, 볼캡으로 완성!',
      password: 'password1234',
      categories: [
        { type: 'TOP', name: '후드집업', brand: '스투시', price: 129000n },
        { type: 'BOTTOM', name: '카고팬츠', brand: '칼하트', price: 99000n },
        { type: 'ACCESSORY', name: '볼캡', brand: '뉴에라', price: 35000n }
      ],
      tagNames: ['스트릿', '캐주얼'],
      imageIdx: [5]
    },
    {
      nickname: '미현',
      title: '러블리 원피스룩',
      content: '플라워 패턴 원피스로 러블리하게',
      password: 'password1234',
      categories: [
        { type: 'DRESS', name: '플라워 원피스', brand: '로엠', price: 49000n },
        { type: 'SHOES', name: '메리제인 슈즈', brand: '바바라', price: 59000n }
      ],
      tagNames: ['러블리', '여름'],
      imageIdx: [6]
    },
    {
      nickname: '영지',
      title: '겨울 코트 스타일',
      content: '로브코트와 니트, 부츠로 따뜻하게!',
      password: 'password1234',
      categories: [
        { type: 'OUTER', name: '로브코트', brand: '코스', price: 159000n },
        { type: 'TOP', name: '울 니트', brand: '탑텐', price: 59000n },
        { type: 'SHOES', name: '롱부츠', brand: '닥터마틴', price: 179000n }
      ],
      tagNames: ['겨울', '포멀'],
      imageIdx: [7]
    },
    {
      nickname: '민규',
      title: '스포티 트레이닝룩',
      content: '트랙탑, 트레이닝팬츠, 스니커즈!',
      password: 'password1234',
      categories: [
        { type: 'TOP', name: '트랙탑', brand: '나이키', price: 89000n },
        { type: 'BOTTOM', name: '트레이닝팬츠', brand: '아디다스', price: 69000n },
        { type: 'SHOES', name: '스니커즈', brand: '뉴발란스', price: 99000n }
      ],
      tagNames: ['스포티', '캐주얼'],
      imageIdx: [8]
    },
    {
      nickname: '혜윤',
      title: '모던 가방 포인트룩',
      content: '심플한 블라우스와 컬러백으로 포인트',
      password: 'password1234',
      categories: [
        { type: 'TOP', name: '블라우스', brand: '자라', price: 49000n },
        { type: 'BAG', name: '컬러백', brand: '코치', price: 159000n }
      ],
      tagNames: ['미니멀', '컬러풀'],
      imageIdx: [9]
    },
    {
      nickname: '재욱',
      title: '남친룩의 정석',
      content: '셔츠와 슬랙스, 더비슈즈 깔끔하게!',
      password: 'password1234',
      categories: [
        { type: 'TOP', name: '셔츠', brand: '무신사', price: 39000n },
        { type: 'BOTTOM', name: '슬랙스', brand: '유니클로', price: 59000n },
        { type: 'SHOES', name: '더비슈즈', brand: '닥터마틴', price: 139000n }
      ],
      tagNames: ['포멀', '캐주얼'],
      imageIdx: [0, 9]
    }
  ];

  for (const [i, styleData] of styleDatas.entries()) {
    try {
    const createdStyle = await prisma.style.create({
      data: {
        nickname: styleData.nickname,
        title: styleData.title,
        content: styleData.content,
        password: styleData.password,
        categories: {
          create: styleData.categories,
        },
        styleTags: {
          create: await Promise.all(
            styleData.tagNames.map(async (name) => {
              const tag = await prisma.tag.findUnique({ where: { name } });
              return { tagId: tag.tagId };
            })
          ),
        },
        styleImages: {
          create: styleData.imageIdx.map(idx => ({
            imageId: images[idx].imageId,
          }))
        }
      }
    });
    console.log(`[${i + 1}/10] 스타일 생성 성공:`, createdStyle.title);
  } catch (e) {
    console.error(`[${i + 1}/10] 스타일 생성 실패`, e);
  }
}



const styleList = await prisma.style.findMany({ orderBy: { styleId: 'asc' } });

const curationSeeds = [
  {
    styleIdx: 0, // 혜원, 여름 미니멀룩
    nickname: '리뷰어A',
    content: '여름에 정말 잘 어울리는 룩이네요!',
    password: 'password1234',
    trendy: 5,
    personality: 4,
    practicality: 5,
    costEffectiveness: 4,
  },
  {
    styleIdx: 0,
    nickname: '리뷰어B',
    content: '미니멀하지만 포인트가 살아있어요',
    password: 'password1234',
    trendy: 4,
    personality: 5,
    practicality: 4,
    costEffectiveness: 5,
  },
  {
    styleIdx: 1, // 승관, 빈티지 데님
    nickname: '리뷰어C',
    content: '청자켓 찢어진 데님 조합 최고!',
    password: 'password1234',
    trendy: 3,
    personality: 5,
    practicality: 4,
    costEffectiveness: 3,
  },
  {
    styleIdx: 2, // 우재, 포멀 오피스룩
    nickname: '리뷰어D',
    content: '출근룩 고민 끝났어요!',
    password: 'password1234',
    trendy: 4,
    personality: 3,
    practicality: 5,
    costEffectiveness: 4,
  },
  {
    styleIdx: 3, // 미주, 컬러풀 썸머룩
    nickname: '리뷰어E',
    content: '컬러 매치 센스가 대박~',
    password: 'password1234',
    trendy: 5,
    personality: 5,
    practicality: 3,
    costEffectiveness: 4,
  },
  {
    styleIdx: 4, // 보검, 스트릿
    nickname: '리뷰어F',
    content: '볼캡+카고 조합 킹왕짱!',
    password: 'password1234',
    trendy: 5,
    personality: 4,
    practicality: 4,
    costEffectiveness: 5,
  },
  {
    styleIdx: 5, // 미현, 원피스
    nickname: '리뷰어G',
    content: '꽃무늬 원피스 진짜 예뻐요',
    password: 'password1234',
    trendy: 4,
    personality: 4,
    practicality: 3,
    costEffectiveness: 4,
  },
  {
    styleIdx: 6, // 영지, 겨울코트
    nickname: '리뷰어H',
    content: '따뜻+스타일 다 잡았네',
    password: 'password1234',
    trendy: 3,
    personality: 3,
    practicality: 5,
    costEffectiveness: 5,
  },
  {
    styleIdx: 7, // 민규, 스포티
    nickname: '리뷰어I',
    content: '운동할 때도 패션을 챙기다니!',
    password: 'password1234',
    trendy: 4,
    personality: 4,
    practicality: 5,
    costEffectiveness: 4,
  },
  {
    styleIdx: 8, // 혜윤, 모던 가방
    nickname: '리뷰어J',
    content: '컬러백이 포인트!',
    password: 'password1234',
    trendy: 3,
    personality: 5,
    practicality: 4,
    costEffectiveness: 3,
  },
  {
    styleIdx: 9, // 재욱, 남친룩
    nickname: '리뷰어K',
    content: '깔끔한 남친룩의 정석',
    password: 'password1234',
    trendy: 5,
    personality: 4,
    practicality: 5,
    costEffectiveness: 4,
  },
];

for (const curation of curationSeeds) {
  await prisma.curation.create({
    data: {
      styleId: styleList[curation.styleIdx].styleId,
      nickname: curation.nickname,
      content: curation.content,
      password: curation.password,
      trendy: curation.trendy,
      personality: curation.personality,
      practicality: curation.practicality,
      costEffectiveness: curation.costEffectiveness,
    },
  });
}
console.log('큐레이션 시딩 완료!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
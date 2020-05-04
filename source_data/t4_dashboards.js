export default [
  {
    industry: ['Technology', 'Cybersecurity'],
    dashboard: {
      recommendedSearches: [
        {
          title: 'IoT Security Market Size',
          searchParams: {
            industry: ['Technology', 'Cybersecurity', 'IoT Security'],
            excludeSubindustries: true,
            metric: 'Sales',
          },
        },
        {
          title: 'Endpoint Security Market Share',
          searchParams: {
            industry: ['Technology', 'Cybersecurity', 'Endpoint Security'],
            metric: 'Sales',
            segmentation: ['Vendor'],
          },
        },
        {
          title: 'Cybersecurity Breaches by Industry Vertical',
          searchParams: {
            industry: [
              'Technology',
              'Cybersecurity',
              'Survey & Statistics Data',
              'Security Breaches',
              'Number of Threats / Breaches / Attacks',
            ],
            quickFilter: 'industry',
          },
        },
        {
          title: 'Email Phishing Statistics',
          searchParams: {
            industry: [
              'Technology',
              'Cybersecurity',
              'Survey & Statistics Data',
              'Security Breaches',
              'Number of Threats / Breaches / Attacks',
              'Number of Threats / Breaches / Attacks - Phishing',
            ],
          },
        },
      ],
      recommendedReports: [
        {
          publisher: 'Gemalto',
          title: 'Data Breach Database',
          date: 'Aug 2019',
          quality: 2,
          url: 'https://breachlevelindex.com',
        },
        {
          publisher: 'New Century Capital Partners',
          title: 'Cybersecurity Spotlight May 2019',
          date: 'May 2019',
          quality: 2,
          url:
            'http://www.newcenturycap.com/wp-content/uploads/2019/06/Cybersecurity-Industry-Landscape-Report-May-2019.pdf',
        },
        {
          publisher: 'TADVISER',
          title: 'Information Security (World Market)',
          date: 'Mar 2019',
          quality: 2,
          url:
            'http://tadviser.com/index.php/Article:Information_security_(world_market)#Growth_by_9.25_to_.2437_billion_is_Canalys',
        },
        {
          publisher: 'Momentum',
          title: 'Cybersecurity Almanac 2019',
          date: 'Feb 2019',
          quality: 3,
          url:
            'https://momentumcyber.com/docs/Yearly/2019_Cybersecurity_Almanac_Public_Edition.pdf',
        },
        {
          publisher: 'Gartner',
          title:
            'Gartner Forecasts Worldwide Information Security Spending to Exceed $124 Billion in 2019',
          date: 'Aug 2018',
          quality: 3,
          url:
            'https://www.gartner.com/en/newsroom/press-releases/2018-08-15-gartner-forecasts-worldwide-information-security-spending-to-exceed-124-billion-in-2019',
        },
        {
          publisher: 'Credit Suisse',
          title: 'Cybersecurity Initiation - The Cloud Has No Walls',
          date: 'Sep 2017',
          quality: 3,
          url:
            'https://research-doc.credit-suisse.com/docView?language=ENG&format=PDF&sourceid=em&document_id=1079780681&serialid=G6OoCtYpIZ7vHJ1E9iHlkWRn4b4YIBJtKN5CTM9UtC0%3D',
        },
      ],
    },
  },
];

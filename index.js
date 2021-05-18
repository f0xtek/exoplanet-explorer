const parse = require('csv-parse');
const fs = require('fs');

const DISPOSITION_COLUMN = process.env.DISPOSITION_COLUMN || 'koi_disposition';
const HABITABLE_INDICATOR = process.env.HABITABLE_INDICATOR || 'CONFIRMED';
const INSOLATION_FLUX_COLUMN =
  process.env.INSOLATION_FLUX_COLUMN || 'koi_insol';
const INSOLATION_FLUX_LIMIT_LOW = 0.36;
const INSOLATION_FLUX_LIMIT_HIGH = 1.11;
const PLANETARY_RADII_COLUMN = process.env.PLANETARY_RADII_COLUMN || 'koi_prad';
const PLANETARY_RADII_LIMIT = 1.6;
const KEPLER_NAME = process.env.KEPLER_NAME || 'kepoi_name';
const habitablePlanets = [];

const isPotentiallyHabitable = (planet) => {
  return (planet[DISPOSITION_COLUMN] =
    HABITABLE_INDICATOR &&
    planet[INSOLATION_FLUX_COLUMN] > INSOLATION_FLUX_LIMIT_LOW &&
    planet[INSOLATION_FLUX_COLUMN] < INSOLATION_FLUX_LIMIT_HIGH &&
    planet[PLANETARY_RADII_COLUMN] < PLANETARY_RADII_LIMIT);
};

fs.createReadStream('koi_data.csv')
  .pipe(
    parse({
      comment: '#',
      delimiter: ',',
      columns: true,
    })
  )
  .on('data', (data) => {
    if (isPotentiallyHabitable(data)) {
      habitablePlanets.push(data);
    }
  })
  .on('error', (err) => {
    console.log(err);
  })
  .on('end', () => {
    console.log(
      `Number of habitable planets found: ${habitablePlanets.length}`
    );
    console.log(habitablePlanets.map((planet) => planet[KEPLER_NAME]));
    console.log('Done!');
  });

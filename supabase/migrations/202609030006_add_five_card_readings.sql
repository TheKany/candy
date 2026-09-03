alter table tarot_position_readings
  drop constraint if exists tarot_position_readings_reading_type_check;

alter table tarot_position_readings
  add constraint tarot_position_readings_reading_type_check
  check (reading_type in ('one', 'three', 'five', 'celtic', 'horoscope'));

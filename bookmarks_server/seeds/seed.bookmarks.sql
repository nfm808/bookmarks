BEGIN;

insert into bookmarks (title, url, rating, description)
values
  ('Google', 'http://www.google.com', '4', 'search baby'),
  ('Thinkful', 'http://www.thinkful.com', '2', 'think it over'),
  ('Slash Dot', 'http://www.slashdot.org', '4', 'news for nerds'),
  ('4chan', 'http://4chan.org', '1', 'an armpit of the internet'),
  ('Roccos', 'http://roccospizzapub.com', '3', 'beer'),
  ('Gog', 'http://www.gog.com', '5', 'games baby'),
  ('Statements', 'http://statementshawaii.com', '2', 'furniture on the big island'),
  ('Hawaii', 'http://hawaii.gov', '1', 'state of hawaii'),
  ('Boomdog', 'http://www.boomdog.com', '1', 'who knows'),
  ('Reddit', 'http://reddit.com', '3', 'a place to find community...or something'),
  ('test', 'http://test.com', '4', 'do not attempt to adjust your television sets');

COMMIT;
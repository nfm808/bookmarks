BEGIN;

insert into bookmarks (name, url, rating)
values
  ('Google', 'http://www.google.com', '4'),
  ('Thinkful', 'http://www.thinkful.com', '2'),
  ('Slash Dot', 'http://www.slashdot.org', '4'),
  ('4chan', 'http://4chan.org', '1'),
  ('Roccos', 'http://roccospizzapub.com', '3'),
  ('Gog', 'http://www.gog.com', '5'),
  ('Statements', 'http://statementshawaii.com', '2'),
  ('Hawaii', 'http://hawaii.gov', '1'),
  ('Boomdog', 'http://www.boomdog.com', '1'),
  ('Reddit', 'http://reddit.com', '3'),
  ('test', 'http://test.com', '4');

COMMIT;
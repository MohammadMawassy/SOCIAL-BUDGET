select p.id, p.username, p.description, p.budget, COALESCE(v.rate, 0) as rate from Proposal p left join (select * from Vote where user_id = ?) as v on p.id = v.proposal_id where p.username != ?;
-- select p.id, p.username, p.description, p.budget, COALESCE(v.rate, 0)  from Proposal p left join Vote v on p.id = v.proposal_id where p.username == "admin" ;

-- INSERT INTO Vote (proposal_id, user_id, rate) VALUES (4, 4, 3);
-- DELETE FROM Vote WHERE proposal_id = 1 AND user_id = 1;
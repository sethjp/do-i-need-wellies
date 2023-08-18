> What tests do I want to set up?

(Welly Decider) System test that tests the top half of the system.

Test for the express server.

Test for the Welly Decider subsystem.

Test for the English Weather Provider.

Test for the Weather Extractor.

end-to-end test.

> What order should I write those?

System test.

Welly Decider.

English Weather Provider.

Weather Extractor.

Express server.



End-to-end?

> Why?

Because the stuff that I'm writing at the moment is the Welly Decider system.

The express server is a lightweight link between the client and the bulk of the server so it doesn't need much testing.

The end-to-end stuff is last because I'm not completely sure if I'll bother doing it depending on how long the rest of this takes me.

---

> What does the (Welly Decider) System test do?

It would test that data can be retrieved from a Weather Provider and return an expected result whether to wear wellies or not.

> What does the Welly Decider test do?

Tests that an expected result is returned for a given input.

> What does the English Weather Provider test do?

Tests that the right data is being retrieved from the database.

> What does the Weather Extractor test do?

Tests that given data in the same format as the Uk Environment Agency will provide, the English Weather Extractor will munge the data and store it.

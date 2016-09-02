Feature: data pumps

  Scenario: sustaining a flow should respond pump awaits
    When I am waiting for data using a pump
    Then I should be notified when the related flow is sustained

  Scenario: sustaining a flow should respond pump pulls
    When I pull data using a pump
    Then the pump should notice the pull
    And I should be notified when the related flow is sustained

  Scenario: pump pushes can sustain a flow
    When I push data using a pump
    Then the pump should notice the push
    And I should be able to sustain the flow with it

  Scenario: awaiting dry and blocked flow leads to failure
    When I have a dry and blocked flow
    Then I should not be able to wait for it using a pump

  Scenario: awaiting a non-dry but blocked flow
    When I have a non-dry but blocked flow
    Then I should be able to await and extract the rest of the data from it

  Scenario: awaiting a flow which goes dry and blocked meanwhile leads to failure
    When I await data from a flow using a pump
    Then I should get an error when the flow goes dry and blocked meanwhile
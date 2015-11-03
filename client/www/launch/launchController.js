sphero.controller('launchController', ['$scope', '$state', 'player', 'socket', function($scope, $state, player, socket) {


	$scope.join = function() {

		$state.go('profile.loading', { action: 'join' });

  };

  $scope.back = function() {
    $state.go('nav');
  }

  $scope.profile = player.profile;
  console.log($scope.profile);

  $scope.logout = function() {
    Auth.destroyCredentials();
  };

  $scope.hostGame = function() {

    $state.go('profile.host');

  };


  $scope.init = function() {

    socket.emit('grabProfile', player.profile);

  };

  $scope.init();

  // animation ====================

  var colors = ["#fc9bcb", "#97d9a1", "#00a8db", "#787b8c"];

  width = window.innerWidth;
  height = window.innerHeight * 0.7;

  var animate = d3.select('#animate')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'svg');

  //will refactor these into a class tomorrow (zs)

  var ball0 = animate.append('circle')
    .style('fill', colors[0])
    .attr("r", 25)
    .attr("cx", 50)
    .attr("cy", 50)

  var ball1 = animate.append('circle')
    .style('fill', colors[1])
    .attr("r", 25)
    .attr("cx", 100)
    .attr("cy", 100)

  var ball2 = animate.append('circle')
    .style('fill', colors[2])
    .attr("r", 25)
    .attr("cx", 150)
    .attr("cy", 150)

  var ball3 = animate.append('circle')
    .style('fill', colors[3])
    .attr("r", 25)
    .attr("cx", 200)
    .attr("cy", 200)


  moveH0 = 3;
  moveV0 = 3;

  moveH1 = -3;
  moveV1 = 3;

  moveH2 = 3;
  moveV2 = -3;

  moveH3 = -3;
  moveV3 = -3;


  var move0 = function() {
    ball0.attr("cx", function() {
        var xPos = +d3.select(this).attr("cx");
        if (xPos > width - 25 || xPos < 0 + 25) {
          moveH0 *= -1;
        }
        return xPos += moveH0;
      })
      .attr("cy", function() {
        var yPos = +d3.select(this).attr("cy");
        if (yPos > height - 25 || yPos < 0 + 25) {
          moveV0 *= -1;
        }
        return yPos += moveV0;
      });
    window.requestAnimationFrame(move0);
  }

  var move1 = function() {
    ball1.attr("cx", function() {
        var xPos = +d3.select(this).attr("cx");
        if (xPos > width - 25 || xPos < +25) {
          moveH1 *= -1;
        }
        return xPos += moveH1;
      })
      .attr("cy", function() {
        var yPos = +d3.select(this).attr("cy");
        if (yPos > height - 25 || yPos < 0 + 25) {
          moveV1 *= -1;
        }
        return yPos += moveV1;
      });
    window.requestAnimationFrame(move1);
  }

  var move2 = function() {
    ball2.attr("cx", function() {
        var xPos = +d3.select(this).attr("cx");
        if (xPos > width - 25 || xPos < 0 + 25) {
          moveH2 *= -1;
        }
        return xPos += moveH2;
      })
      .attr("cy", function() {
        var yPos = +d3.select(this).attr("cy");
        if (yPos > height - 25 || yPos < 0 + 25) {
          moveV2 *= -1;
        }
        return yPos += moveV2;
      });
    window.requestAnimationFrame(move2);
  }

  var move3 = function() {
    ball3.attr("cx", function() {
        var xPos = +d3.select(this).attr("cx");
        if (xPos > width - 25 || xPos < 0 + 25) {
          moveH3 *= -1;
        }
        return xPos += moveH3;
      })
      .attr("cy", function() {
        var yPos = +d3.select(this).attr("cy");
        if (yPos > height - 25 || yPos < 0 + 25) {
          moveV3 *= -1;
        }
        return yPos += moveV3;
      });
    window.requestAnimationFrame(move3);
  }

  //collisions

  var distance = function(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((x2 - x1), 2));
  }

  window.requestAnimationFrame(move0);
  window.requestAnimationFrame(move1);
  window.requestAnimationFrame(move2);
  window.requestAnimationFrame(move3);


}]);
